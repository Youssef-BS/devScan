const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

/**
 * Trigger a new code scan analysis
 */
export async function triggerScan(repoId: number, commitId: number, code: string) {
  const response = await fetch(`${API_BASE}/analysis/scan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ repoId, commitId, code }),
  });

  if (!response.ok) throw new Error("Failed to trigger scan");
  return response.json();
}

/**
 * Save analysis results to database
 */
export async function saveAnalysisResults(
  scanId: number,
  analysisResult: any,
  score?: number,
  grade?: string
) {
  const response = await fetch(`${API_BASE}/analysis/scan/${scanId}/results`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ analysisResult, score, grade }),
  });

  if (!response.ok) throw new Error("Failed to save analysis results");
  return response.json();
}

/**
 * Get a single scan with its issues
 */
export async function getScan(scanId: number) {
  const response = await fetch(`${API_BASE}/analysis/scan/${scanId}`, {
    credentials: "include",
  });

  if (!response.ok) throw new Error("Failed to get scan");
  return response.json();
}

/**
 * Get all scans for a repository
 */
export async function getRepoScans(repoId: number, limit = 50) {
  const response = await fetch(
    `${API_BASE}/analysis/repo/${repoId}/scans?limit=${limit}`,
    { credentials: "include" }
  );

  if (!response.ok) throw new Error("Failed to get repo scans");
  return response.json();
}

/**
 * Get issues for a scan with optional filters
 */
export async function getScanIssues(
  scanId: number,
  filters?: {
    severity?: string;
    type?: string;
    status?: string;
  }
) {
  const params = new URLSearchParams();
  if (filters?.severity) params.append("severity", filters.severity);
  if (filters?.type) params.append("type", filters.type);
  if (filters?.status) params.append("status", filters.status);

  const response = await fetch(
    `${API_BASE}/analysis/scan/${scanId}/issues?${params}`,
    { credentials: "include" }
  );

  if (!response.ok) throw new Error("Failed to get scan issues");
  return response.json();
}

/**
 * Get issue statistics for a scan
 */
export async function getIssueStats(scanId: number) {
  const response = await fetch(`${API_BASE}/analysis/scan/${scanId}/stats`, {
    credentials: "include",
  });

  if (!response.ok) throw new Error("Failed to get issue stats");
  return response.json();
}

/**
 * Update issue status
 */
export async function updateIssueStatus(issueId: number, status: string) {
  const response = await fetch(`${API_BASE}/analysis/issue/${issueId}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ status }),
  });

  if (!response.ok) throw new Error("Failed to update issue status");
  return response.json();
}

/**
 * Mark issue as false positive
 */
export async function markFalsePositive(issueId: number) {
  const response = await fetch(
    `${API_BASE}/analysis/issue/${issueId}/false-positive`,
    {
      method: "POST",
      credentials: "include",
    }
  );

  if (!response.ok) throw new Error("Failed to mark false positive");
  return response.json();
}

export default {
  triggerScan,
  saveAnalysisResults,
  getScan,
  getRepoScans,
  getScanIssues,
  getIssueStats,
  updateIssueStatus,
  markFalsePositive,
};
