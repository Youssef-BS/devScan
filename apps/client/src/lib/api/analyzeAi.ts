const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

import {AnalysisResult} from "@/types/AnalyseResult";

export const analyseCodeApi = async (
  code: string,
  sha?: string,
  analysisType: string = "audit"
): Promise<AnalysisResult> => {
  const response = await fetch(`${apiUrl}/github/commit/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      code,
      sha,
      analysisType,
    }),
  });

  if (!response.ok) {
    let errorMsg = response.statusText;

    try {
      const errorData = await response.json();
      errorMsg = errorData.error || errorData.message || response.statusText;
    } catch (e) {
      console.warn("Failed to parse error response", e);
    }

    if (response.status === 408) {
      errorMsg =
        "Analysis timeout: The AI took too long. Try analyzing smaller code chunks.";
    } else if (response.status === 503) {
      errorMsg =
        "AI service is not available. Please try again later.";
    } else if (response.status === 400) {
      errorMsg = "Code is required for analysis";
    }

    throw new Error(errorMsg);
  }

  return response.json();
};