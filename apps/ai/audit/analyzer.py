import os
import re
import asyncio
from langchain_ollama import ChatOllama
from langchain_core.prompts import ChatPromptTemplate

from .prompts import (
    SECURITY_AGENT_PROMPT,
    PERFORMANCE_AGENT_PROMPT,
    CLEAN_CODE_AGENT_PROMPT,
    CHATBOT_PROMPT,
    COMBINED_AGENT_PROMPT,
)

# ─── Config ──────────────────────────────────────────────────────────────

MODEL_NAME      = os.getenv("MODEL_NAME", "gemma3:4b")
TEMPERATURE     = float(os.getenv("TEMPERATURE", "0.3"))
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")

llm = ChatOllama(
    model=MODEL_NAME,
    base_url=OLLAMA_BASE_URL,
    temperature=TEMPERATURE,
)

# ─── Context windowing ────────────────────────────────────────────────────

CHUNK_SIZE    = int(os.getenv("CHUNK_SIZE", "6000"))
CHUNK_OVERLAP = int(os.getenv("CHUNK_OVERLAP", "300"))


def chunk_code(code: str) -> list[str]:
    """Split code into overlapping chunks that fit within the model context."""
    if len(code) <= CHUNK_SIZE:
        return [code]

    chunks: list[str] = []
    start = 0

    while start < len(code):
        end   = start + CHUNK_SIZE
        chunk = code[start:end]

        # Prefer breaking on a newline boundary
        if end < len(code):
            last_nl = chunk.rfind("\n")
            if last_nl > CHUNK_SIZE // 2:
                chunk = chunk[:last_nl]

        chunks.append(chunk)
        advance = len(chunk) - CHUNK_OVERLAP
        start  += max(advance, 1)   # guard against zero/negative advance

    return chunks


# ─── Issue parser ─────────────────────────────────────────────────────────

_SKIP_TITLES = re.compile(
    r"no\s+(security|performance|code.quality|issues?)\s+(issues?\s+)?(found|detected|identified)",
    re.IGNORECASE,
)

_SEVERITY_MAP = {
    "critical": "CRITICAL", "high": "HIGH", "medium": "MEDIUM",
    "moderate": "MEDIUM",   "low": "LOW",   "info": "LOW",
}
_TYPE_MAP = {
    "vulnerability": "VULNERABILITY", "security": "VULNERABILITY",
    "bug": "BUG", "performance": "BUG",
    "code_smell": "CODE_SMELL", "smell": "CODE_SMELL", "quality": "CODE_SMELL",
}


def _extract_field(block: str, key: str) -> str | None:
    """Case-insensitive field extraction with flexible whitespace/colon."""
    m = re.search(rf"(?i){re.escape(key)}\s*[:\-]\s*(.+)", block)
    return m.group(1).strip() if m else None


def _extract_multiline(block: str, key: str) -> str | None:
    """Extract a multi-line field that ends at the next keyword or end of block."""
    m = re.search(
        rf"(?i){re.escape(key)}\s*[:\-]\s*(.*?)(?=\n[A-Z]{{2,}}[\s:]|```|$)",
        block, re.DOTALL,
    )
    return m.group(1).strip() if m else None


def _extract_fix(block: str) -> str | None:
    """Extract corrected-code fenced blocks, tolerating varied fence names."""
    m = re.search(
        r"```(?:corrected[- _]code[^\n]*|python|javascript|typescript|js|ts|fix)[^\n]*\n(.*?)```",
        block, re.DOTALL | re.IGNORECASE,
    )
    if m:
        return m.group(1).strip()
    # fallback: first generic code block after FIX:
    m = re.search(r"(?i)fix\s*[:\-][^\n]*\n```[^\n]*\n(.*?)```", block, re.DOTALL)
    return m.group(1).strip() if m else None


def parse_agent_output(text: str, agent_name: str) -> list[dict]:
    """Extract structured issues from agent output.

    Handles:
    - Strict ---ISSUE---/---END--- blocks (original format)
    - Looser separator variants (===, ***, ## Issue N, **Issue N**)
    - Partial blocks (missing END marker)
    - Fallback: entire response treated as one issue if no block found
    """
    issues: list[dict] = []

    # ── Try strict delimiters first ──────────────────────────────────────
    # Accept variations: ---, ***, ===, ## as delimiters; case-insensitive ISSUE/END
    blocks = re.findall(
        r"(?:---+|===+|\*\*\*+)\s*ISSUE\s*(?:---+|===+|\*\*\*+)(.*?)"
        r"(?:---+|===+|\*\*\*+)\s*END\s*(?:---+|===+|\*\*\*+)",
        text, re.DOTALL | re.IGNORECASE,
    )

    # ── Fallback: split on numbered headings ("## Issue 1", "**Issue 1:**") ─
    if not blocks:
        blocks = re.split(
            r"\n(?:#{1,3}\s*Issue\s+\d+|---+\s*\d+|Issue\s+\d+\s*[:\-])\s*\n",
            text, flags=re.IGNORECASE,
        )
        blocks = [b for b in blocks if len(b.strip()) > 40]

    # ── Last resort: treat the whole response as one block ───────────────
    if not blocks and len(text.strip()) > 40:
        blocks = [text]

    default_type = {
        "security":    "VULNERABILITY",
        "performance": "BUG",
        "clean_code":  "CODE_SMELL",
    }.get(agent_name, "CODE_SMELL")

    for block in blocks:
        issue: dict = {
            "agent":       agent_name,
            "severity":    "MEDIUM",
            "type":        default_type,
            "title":       "Issue detected",
            "file":        "unknown",
            "line":        "unknown",
            "description": block.strip()[:500],
            "fix":         None,
        }

        # agent override (combined prompt sets AGENT: field)
        raw_agent = _extract_field(block, "AGENT")
        if raw_agent:
            raw_agent_lower = raw_agent.lower()
            for a in ("security", "performance", "clean_code"):
                if a.replace("_", "") in raw_agent_lower.replace("_", "").replace(" ", ""):
                    issue["agent"] = a
                    break

        # severity
        raw_sev = _extract_field(block, "SEVERITY") or _extract_field(block, "level")
        if raw_sev:
            for k, v in _SEVERITY_MAP.items():
                if k in raw_sev.lower():
                    issue["severity"] = v
                    break

        # type
        raw_type = _extract_field(block, "TYPE") or _extract_field(block, "category")
        if raw_type:
            for k, v in _TYPE_MAP.items():
                if k in raw_type.lower():
                    issue["type"] = v
                    break

        # title
        title = _extract_field(block, "TITLE") or _extract_field(block, "issue") or _extract_field(block, "name")
        if title:
            issue["title"] = title[:100]

        # skip "no issues" markers
        if _SKIP_TITLES.search(issue["title"]):
            continue

        # file
        f = _extract_field(block, "FILE") or _extract_field(block, "filename")
        if f:
            issue["file"] = f.strip("`'\"")

        # line
        ln = _extract_field(block, "LINE") or _extract_field(block, "line number")
        if ln:
            issue["line"] = ln.strip()

        # description
        desc = (
            _extract_multiline(block, "DESCRIPTION")
            or _extract_multiline(block, "explanation")
            or _extract_multiline(block, "details")
        )
        if desc:
            issue["description"] = desc

        # fix
        fix = _extract_fix(block)
        if fix:
            issue["fix"] = fix

        # skip very short/empty blocks (likely noise)
        if len(issue["description"]) < 15:
            continue

        issues.append(issue)

    return issues


# ─── Chunk runner ─────────────────────────────────────────────────────────

async def _run_agent_on_chunks(
    prompt_template: str, code: str, agent_name: str
) -> tuple[str, list[dict]]:
    """Run a single agent over all code chunks in parallel."""
    prompt = ChatPromptTemplate.from_template(prompt_template)
    chain  = prompt | llm
    chunks = chunk_code(code)

    async def run_chunk(chunk: str) -> str:
        try:
            result = await chain.ainvoke({"code": chunk})
            return result.content
        except Exception as exc:
            err = str(exc).lower()
            # Surface connection/availability errors immediately
            if any(kw in err for kw in ("connection", "refused", "unreachable", "connect error")):
                raise ConnectionError(
                    f"Cannot reach LLM backend. Is Ollama running? ({exc})"
                ) from exc
            # For other per-chunk errors, return empty string so remaining chunks proceed
            print(f"[{agent_name}] chunk error (skipping): {exc}")
            return ""

    # return_exceptions=False so the first ConnectionError propagates immediately
    results      = await asyncio.gather(*[run_chunk(c) for c in chunks])
    combined_raw = "\n".join(r for r in results if r)
    issues       = parse_agent_output(combined_raw, agent_name)

    return combined_raw, issues


# ─── Single combined agent (fast) ────────────────────────────────────────────

async def run_combined_agent(code: str) -> dict:
    """One LLM call covering security + performance + clean_code.

    3x faster than run_multi_agent because Ollama processes one request
    at a time — concurrent calls just queue up with extra overhead.
    """
    raw, issues = await _run_agent_on_chunks(COMBINED_AGENT_PROMPT, code, "combined")

    # Normalise agent field: combined prompt sets AGENT: <name> in each block
    sec_issues   = [i for i in issues if i.get("agent") in ("security",    "combined") and i.get("type") == "VULNERABILITY"]
    perf_issues  = [i for i in issues if i.get("agent") in ("performance", "combined") and i.get("type") == "BUG"]
    clean_issues = [i for i in issues if i.get("agent") in ("clean_code",  "combined") and i.get("type") == "CODE_SMELL"]

    # Any unclassified issues fall into clean_code
    classified = set(id(i) for i in sec_issues + perf_issues + clean_issues)
    for i in issues:
        if id(i) not in classified:
            i["agent"] = "clean_code"
            clean_issues.append(i)

    corrected = [
        {"issue": idx + 1, "code": issue["fix"]}
        for idx, issue in enumerate(issues)
        if issue.get("fix")
    ]

    return {
        "combined": raw,
        "issues":   issues,
        "corrected_examples": corrected,
        "breakdown": {
            "security":    len(sec_issues),
            "performance": len(perf_issues),
            "clean_code":  len(clean_issues),
        },
    }


# ─── Multi-agent orchestrator (kept for reference / USE_MULTI_AGENT=true) ────

async def run_multi_agent(code: str) -> dict:
    """Run all three agents sequentially (not concurrently) to avoid
    overwhelming a single local Ollama instance."""
    sec   = await _run_agent_on_chunks(SECURITY_AGENT_PROMPT,    code, "security")
    perf  = await _run_agent_on_chunks(PERFORMANCE_AGENT_PROMPT, code, "performance")
    clean = await _run_agent_on_chunks(CLEAN_CODE_AGENT_PROMPT,  code, "clean_code")

    sec_raw,   sec_issues   = sec
    perf_raw,  perf_issues  = perf
    clean_raw, clean_issues = clean

    all_issues = sec_issues + perf_issues + clean_issues
    corrected  = [
        {"issue": idx + 1, "code": issue["fix"]}
        for idx, issue in enumerate(all_issues)
        if issue.get("fix")
    ]

    return {
        "combined": (
            f"## Security Analysis\n{sec_raw}\n\n"
            f"## Performance Analysis\n{perf_raw}\n\n"
            f"## Clean Code Analysis\n{clean_raw}"
        ),
        "issues":             all_issues,
        "corrected_examples": corrected,
        "breakdown": {
            "security":    len(sec_issues),
            "performance": len(perf_issues),
            "clean_code":  len(clean_issues),
        },
    }


# ─── Chatbot ──────────────────────────────────────────────────────────────────

async def run_chatbot(query: str) -> str:
    """Single-agent conversational response (async)."""
    prompt = ChatPromptTemplate.from_template(CHATBOT_PROMPT)
    chain  = prompt | llm
    result = await chain.ainvoke({"code": query})
    return result.content


# ─── Public API ───────────────────────────────────────────────────────────────

# Set USE_MULTI_AGENT=true in .env to revert to the 3-agent sequential mode.
_USE_MULTI = os.getenv("USE_MULTI_AGENT", "false").lower() == "true"


async def analyze_code_async(code: str, analysis_type: str = "audit") -> dict:
    if analysis_type == "chatbot":
        raw = await run_chatbot(code)
        return {
            "analysis":           raw,
            "corrected_examples": [],
            "issues":             [],
            "agent_breakdown":    None,
            "analysis_type":      "chatbot",
        }

    result = await (run_multi_agent(code) if _USE_MULTI else run_combined_agent(code))

    return {
        "analysis":           result["combined"],
        "corrected_examples": result["corrected_examples"],
        "issues":             result["issues"],
        "agent_breakdown":    result["breakdown"],
        "analysis_type":      analysis_type,
    }
