import { useState, useCallback, useRef } from "react";
import { analyseCodeApi } from "../services/analyzeAi.service";
import { AnalysisResult } from "@/types/AnalyseResult";
import { toast } from "sonner";

interface AnalysisState {
  status: "idle" | "analyzing" | "processing" | "success" | "error";
  progress: number;
  currentStep: string;
}

export const useAIAnalysis = () => {
  const [state, setState] = useState<AnalysisState>({
    status: "idle",
    progress: 0,
    currentStep: ""
  });
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const analyzeCode = useCallback(
    async (
      code: string,
      sha?: string,
      analysisType: string = "audit"
    ) => {
      // Don't analyze empty code
      if (!code || code.trim().length === 0) {
        const msg = "No code to analyze";
        setError(msg);
        toast.error(msg);
        return null;
      }

      // Check code size (max 500KB)
      const codeSizeKB = new Blob([code]).size / 1024;
      if (codeSizeKB > 500) {
        const msg = `Code too large (${codeSizeKB.toFixed(1)}KB). Max 500KB.`;
        setError(msg);
        toast.error(msg);
        return null;
      }

      setError(null);
      setState({
        status: "analyzing",
        progress: 10,
        currentStep: "Preparing analysis..."
      });

      const toastId = toast.loading("Analyzing code with AI...");

      try {
        // Create abort controller for this request
        abortControllerRef.current = new AbortController();

        // Update progress
        setState({
          status: "analyzing",
          progress: 30,
          currentStep: "Sending to AI service..."
        });

        const data = await analyseCodeApi(code, sha, analysisType);

        setState({
          status: "processing",
          progress: 70,
          currentStep: "Processing results..."
        });

        setResult(data);

        // Small delay for progress animation
        await new Promise(resolve => setTimeout(resolve, 300));

        setState({
          status: "success",
          progress: 100,
          currentStep: "Analysis complete!"
        });

        toast.success("Analysis complete! ✓", { id: toastId });
        
        // Reset to idle after a moment
        setTimeout(() => {
          setState({ status: "idle", progress: 0, currentStep: "" });
        }, 1000);

        return data;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to analyze code";

        setError(errorMessage);
        setState({
          status: "error",
          progress: 0,
          currentStep: ""
        });

        // Show appropriate error message
        if (errorMessage.includes("timeout")) {
          toast.error("Analysis took too long. Try smaller code chunks.", { id: toastId });
        } else if (errorMessage.includes("not available")) {
          toast.error("AI service unavailable. Check if it's running.", { id: toastId });
        } else {
          toast.error(errorMessage, { id: toastId });
        }

        console.error("AI Analysis Error:", errorMessage);
        return null;
      }
    },
    []
  );

  const cancelAnalysis = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setState({ status: "idle", progress: 0, currentStep: "" });
    toast.error("Analysis cancelled");
  }, []);

  const clearResult = useCallback(() => {
    setResult(null);
    setError(null);
    setState({ status: "idle", progress: 0, currentStep: "" });
  }, []);

  return {
    analyzeCode,
    cancelAnalysis,
    clearResult,
    loading: state.status === "analyzing" || state.status === "processing",
    analyzing: state.status === "analyzing",
    processing: state.status === "processing",
    error,
    result,
    progress: state.progress,
    currentStep: state.currentStep,
    status: state.status
  };
};