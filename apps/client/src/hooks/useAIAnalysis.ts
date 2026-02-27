import { useState } from "react";
import { analyseCodeApi, AnalysisResult } from "@/lib/api/analyzeAi";

export const useAIAnalysis = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const analyzeCode = async (
    code: string,
    sha?: string,
    analysisType: string = "audit"
  ) => {
    setLoading(true);
    setError(null);

    try {
      const data = await analyseCodeApi(code, sha, analysisType);
      setResult(data);
      return data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error";

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