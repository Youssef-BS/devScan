import { useState } from "react";

interface AnalysisResult {
  analysis: string;
  timestamp: string;
  correctedExamples?: Array<{
    issue: number;
    code: string;
  }>;
  error?: string;
}

export const useAIAnalysis = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const analyzeCode = async (code: string, sha?: string, analysisType: string = "audit") => {
    setLoading(true);
    setError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const response = await fetch(`${apiUrl}/github/commit/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          sha,
          analysisType: analysisType,
        }),
      });

      if (!response.ok) {
        // Try to parse error message from response
        let errorMsg = response.statusText;
        try {
          const errorData = await response.json();
          errorMsg = errorData.error || errorData.message || response.statusText;
        } catch (e) {
          // Fallback to status text if response is not JSON
        }
        
        // Map status codes to user-friendly messages
        if (response.status === 408) {
          errorMsg = "⏱️ Analysis timeout: The AI took too long. Try analyzing smaller code chunks.";
        } else if (response.status === 503) {
          errorMsg = "⚠️ AI service is not available. Please try again later.";
        } else if (response.status === 400) {
          errorMsg = "Code is required for analysis";
        }
        
        throw new Error(errorMsg);
      }

      const data = await response.json();
      setResult(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      console.error("AI Analysis Error:", errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const clearResult = () => {
    setResult(null);
    setError(null);
  };

  return {
    analyzeCode,
    loading,
    error,
    result,
    clearResult,
  };
};
