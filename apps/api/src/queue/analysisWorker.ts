import { Worker, Job } from "bullmq";
import axios from "axios";
import { prisma } from "../db.js";
import { redis, AnalysisJobData } from "./analysisQueue.js";

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8003";

// File extensions considered "code" (skip binaries, assets, etc.)
const CODE_EXTENSIONS = new Set([
  ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs",
  ".py", ".java", ".go", ".rs", ".cpp", ".c", ".h",
  ".cs", ".php", ".rb", ".swift", ".kt", ".scala",
  ".vue", ".svelte",
]);

// ─── Selective file fetch (only changed code files) ──────────────────────

async function fetchChangedCode(
  sha: string,
  repoFullName: string,
  accessToken: string,
): Promise<string> {
  const res = await axios.get(
    `https://api.github.com/repos/${repoFullName}/commits/${sha}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github+json",
      },
      timeout: 15_000,
    },
  );

  const files: any[] = res.data.files || [];

  const codeFiles = files.filter((f) => {
    const ext = "." + (f.filename as string).split(".").pop();
    return CODE_EXTENSIONS.has(ext) && f.patch;
  });

  if (codeFiles.length === 0) return "";

  return codeFiles
    .map((f) => `// ── File: ${f.filename} (${f.status}) ──\n${f.patch}`)
    .join("\n\n");
}

// ─── Normalizers ──────────────────────────────────────────────────────────

export function normalizeIssueType(t: string): "BUG" | "VULNERABILITY" | "CODE_SMELL" {
  const map: Record<string, "BUG" | "VULNERABILITY" | "CODE_SMELL"> = {
    VULNERABILITY: "VULNERABILITY", BUG: "BUG", CODE_SMELL: "CODE_SMELL",
  };
  return map[(t || "").toUpperCase()] ?? "CODE_SMELL";
}

export function normalizeSeverity(s: string): "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" {
  const map: Record<string, "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"> = {
    LOW: "LOW", MEDIUM: "MEDIUM", HIGH: "HIGH", CRITICAL: "CRITICAL",
  };
  return map[(s || "").toUpperCase()] ?? "MEDIUM";
}

export function normalizeAgent(a: string): "security" | "performance" | "clean_code" | "bug" {
  const map: Record<string, "security" | "performance" | "clean_code" | "bug"> = {
    security: "security", performance: "performance",
    clean_code: "clean_code", bug: "bug",
  };
  return map[(a || "").toLowerCase()] ?? "clean_code";
}

export function calculateScore(issues: any[]): number {
  if (!issues.length) return 100;
  const deductions: Record<string, number> = {
    CRITICAL: 10, HIGH: 5, MEDIUM: 2, LOW: 1,
  };
  const total = issues.reduce(
    (acc, i) => acc - (deductions[normalizeSeverity(i.severity)] ?? 2),
    100,
  );
  return Math.max(0, total);
}

export function calculateGrade(score: number): string {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

// ─── Job processor ────────────────────────────────────────────────────────

async function processAnalysisJob(job: Job<AnalysisJobData>) {
  const { sha, repoId, repoFullName, accessToken, analysisType = "commit" } = job.data;

  console.log(`[Worker] Processing job ${job.id} — commit ${sha}`);

  // 1. Ensure commit exists in DB
  const commit = await prisma.commit.findUnique({ where: { sha } });
  if (!commit) {
    throw new Error(`Commit ${sha} not found in database`);
  }

  // 2. Create / reset scan record
  const scan = await prisma.scan.upsert({
    where:  { repoId_commitId: { repoId, commitId: commit.id } },
    update: { status: "RUNNING", score: null, grade: null },
    create: { repoId, commitId: commit.id, status: "RUNNING" },
  });

  try {
    // 3. Selectively fetch only changed code files
    const code = await fetchChangedCode(sha, repoFullName, accessToken);

    if (!code) {
      await prisma.scan.update({
        where: { id: scan.id },
        data:  { status: "COMPLETED", score: 100, grade: "A" },
      });
      return { skipped: true, reason: "No code files to analyse" };
    }

    // 4. Call AI service (timeout scales with code length)
    const timeout = Math.max(120_000, Math.min(300_000, code.length * 2));
    const aiRes   = await axios.post(
      `${AI_SERVICE_URL}/analyze`,
      { code, analysis_type: analysisType },
      { timeout },
    );

    const rawIssues: any[] = aiRes.data.issues || [];

    // 5. Persist issues
    if (rawIssues.length > 0) {
      await prisma.issue.createMany({
        data: rawIssues.map((issue) => ({
          title:      (issue.title || "Issue detected").substring(0, 100),
          message:    issue.description || null,
          type:       normalizeIssueType(issue.type),
          severity:   normalizeSeverity(issue.severity),
          filePath:   issue.file || "unknown",
          agent:      normalizeAgent(issue.agent),
          confidence: 0.85,
          fixedCode:  issue.fix  || null,
          tags:       [],
          scanId:     scan.id,
          commitId:   commit.id,
        })),
      });
    }

    // 6. Score & grade
    const score = calculateScore(rawIssues);
    const grade = calculateGrade(score);

    await prisma.scan.update({
      where: { id: scan.id },
      data:  { status: "COMPLETED", score, grade },
    });

    // 7. Auto-resolve issues from previous scans that no longer appear in
    //    the new scan (same repo, same file + title fingerprint).
    const prevOpenIssues = await prisma.issue.findMany({
      where: {
        Scan: { repoId },
        scanId: { not: scan.id },
        status: "OPEN",
      },
      select: { id: true, filePath: true, title: true },
    });

    if (prevOpenIssues.length > 0) {
      // Build a set of fingerprints from the new scan's issues
      const newSigs = new Set(
        rawIssues.map((i) =>
          `${i.file ?? "unknown"}::${(i.title || "").substring(0, 100)}`
        )
      );

      const resolvedIds = prevOpenIssues
        .filter((i) => !newSigs.has(`${i.filePath}::${i.title}`))
        .map((i) => i.id);

      if (resolvedIds.length > 0) {
        await prisma.issue.updateMany({
          where: { id: { in: resolvedIds } },
          data:  { status: "FIXED" },
        });
        console.log(`[Worker] Auto-resolved ${resolvedIds.length} issues from previous scans`);
      }
    }

    console.log(`[Worker] Job ${job.id} done — ${rawIssues.length} issues, score ${score} (${grade})`);
    return { issuesFound: rawIssues.length, score, grade };

  } catch (err: any) {
    await prisma.scan.update({
      where: { id: scan.id },
      data:  { status: "FAILED" },
    });
    throw err;
  }
}

// ─── Worker instance ──────────────────────────────────────────────────────

export const analysisWorker = new Worker<AnalysisJobData>(
  "code-analysis",
  processAnalysisJob,
  {
    connection:  redis,
    concurrency: 3,   // handle up to 3 jobs simultaneously
  },
);

analysisWorker.on("completed", (job, result) => {
  console.log(`[Worker] Completed job ${job.id}:`, result);
});

analysisWorker.on("failed", (job, err) => {
  console.error(`[Worker] Failed job ${job?.id}:`, err.message);
});

analysisWorker.on("error", (err) => {
  console.error("[Worker] Worker error:", err.message);
});
