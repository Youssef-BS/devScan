import os
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from audit.analyzer import analyze_code_async

app = FastAPI(
    title="DevScan AI Service",
    description="Multi-agent AI code analysis engine for DevScan",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Request / Response models ────────────────────────────────────────────

class CodeRequest(BaseModel):
    code: str = Field(..., min_length=1)
    analysis_type: str = Field(
        default="audit",
        description="One of: audit, commit, file_fix, chatbot",
    )


class AnalysisResponse(BaseModel):
    analysis: str
    corrected_examples: list
    issues: list
    agent_breakdown: dict | None
    analysis_type: str


# ─── Routes ───────────────────────────────────────────────────────────────

@app.get("/health")
async def health():
    return {
        "status": "ok",
        "service": "DevScan AI Service v2 (multi-agent)",
        "model": os.getenv("MODEL_NAME", "gemma3:4b"),
        "agents": ["security", "performance", "clean_code"],
    }


@app.post("/analyze", response_model=AnalysisResponse)
async def analyze(request: CodeRequest):
    """
    Run multi-agent analysis on the provided code.

    analysis_type:
      - audit     → full 3-agent scan (security + perf + clean code)
      - commit    → same as audit, focused on diff context
      - file_fix  → same as audit, focused on single-file fixes
      - chatbot   → single conversational agent
    """
    valid_types = {"audit", "chatbot", "commit", "file_fix"}
    if request.analysis_type not in valid_types:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid analysis_type. Must be one of: {valid_types}",
        )

    try:
        result = await analyze_code_async(request.code, analysis_type=request.analysis_type)
        return result

    except ConnectionError as exc:
        raise HTTPException(
            status_code=503,
            detail=(
                f"LLM backend unreachable: {exc}. "
                "Make sure Ollama is running (`ollama serve`) and the model is pulled "
                f"(`ollama pull {os.getenv('MODEL_NAME', 'gemma3:4b')}`)."
            ),
        ) from exc

    except Exception as exc:
        err = str(exc).lower()

        # Catch httpx / requests connection failures by message content
        if any(kw in err for kw in ("connection", "connect error", "refused", "unreachable", "timeout")):
            raise HTTPException(
                status_code=503,
                detail=(
                    f"LLM backend error: {exc}. "
                    "Verify Ollama is running and the model is available."
                ),
            ) from exc

        raise HTTPException(status_code=500, detail=f"Analysis failed: {exc}") from exc


@app.get("/")
async def root():
    return {"message": "DevScan AI Service v2 — multi-agent edition", "docs": "/docs"}


if __name__ == "__main__":
    port  = int(os.getenv("PORT", "8003"))
    debug = os.getenv("DEBUG", "False").lower() == "true"

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=debug,
    )
