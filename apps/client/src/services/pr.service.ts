const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export interface PullRequest {
  number: number;
  title: string;
  body: string;
  state: "open" | "closed";
  draft: boolean;
  author: string;
  avatarUrl: string;
  url: string;
  headSha: string;
  headBranch: string;
  baseBranch: string;
  labels: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ApplyFixPayload {
  filePath: string;
  newContent: string;
  commitMessage: string;
  createPR?: boolean;
  prTitle?: string;
  prBody?: string;
  branch?: string;
}

export interface ApplyFixResult {
  type: "push" | "pr";
  /** Direct push */
  commitSha?: string;
  commitUrl?: string;
  branch?: string;
  /** PR creation */
  prUrl?: string;
  prNumber?: number;
}

export async function listPRs(
  githubId: string,
  state: "open" | "closed" | "all" = "open",
): Promise<PullRequest[]> {
  const res = await fetch(
    `${API_URL}/github/repos/${githubId}/pulls?state=${state}`,
    { credentials: "include" },
  );
  if (!res.ok) throw new Error("Failed to fetch pull requests");
  return res.json();
}

export async function getFileContent(
  githubId: string,
  filePath: string,
  ref = "main",
): Promise<{ content: string; sha: string; path: string }> {
  const res = await fetch(
    `${API_URL}/github/repos/${githubId}/file?path=${encodeURIComponent(filePath)}&ref=${ref}`,
    { credentials: "include" },
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any).message || "Failed to fetch file content");
  }
  return res.json();
}

export async function applyFix(
  githubId: string,
  payload: ApplyFixPayload,
): Promise<ApplyFixResult> {
  const res = await fetch(`${API_URL}/github/repos/${githubId}/apply-fix`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any).message || "Failed to apply fix");
  }
  return res.json();
}
