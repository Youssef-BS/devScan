const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

import { AnalysisResult } from "@/types/AnalyseResult";

// Hard cap on code sent to the AI — keeps local models fast
const MAX_CODE_CHARS = 3000;

// Frontend timeout: 4 minutes (local models are slow but should finish in time)
const FETCH_TIMEOUT_MS = 4 * 60 * 1000;

export const analyseCodeApi = async (
  code: string,
  sha?: string,
  analysisType: string = "audit"
): Promise<AnalysisResult> => {
  // Truncate oversized code before sending
  const truncated = code.length > MAX_CODE_CHARS
    ? code.slice(0, MAX_CODE_CHARS) + "\n// ... (truncated for analysis)"
    : code;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(`${apiUrl}/github/commit/analyze`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: truncated, sha, analysisType }),
      signal: controller.signal,
    });
  } catch (e: any) {
    clearTimeout(timer);
    if (e?.name === "AbortError") {
      throw new Error("Analysis timeout: the AI took too long. Try a smaller file.");
    }
    throw e;
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    let errorMsg = response.statusText;
    try {
      const errorData = await response.json();
      errorMsg = errorData.error || errorData.message || response.statusText;
    } catch {
      // ignore parse error
    }

    if (response.status === 408) {
      errorMsg = "Analysis timeout: the AI took too long. Try a smaller file.";
    } else if (response.status === 503) {
      errorMsg = "AI service unavailable — make sure Ollama is running.";
    } else if (response.status === 400) {
      errorMsg = "Code is required for analysis.";
    }

    throw new Error(errorMsg);
  }

  const data = await response.json();
  if (data.analysis && typeof data.analysis !== "string") {
    data.analysis = typeof data.analysis === "object"
      ? JSON.stringify(data.analysis, null, 2)
      : String(data.analysis);
  }
  return data;
};