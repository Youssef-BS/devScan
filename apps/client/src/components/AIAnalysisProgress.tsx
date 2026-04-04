"use client";

import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Loader2, X } from "lucide-react";

interface AIAnalysisProgressProps {
  progress: number;
  currentStep: string;
  onCancel?: () => void;
  isVisible?: boolean;
}

export function AIAnalysisProgress({
  progress,
  currentStep,
  onCancel,
  isVisible = true
}: AIAnalysisProgressProps) {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-6 right-6 max-w-md bg-white rounded-lg shadow-lg border border-gray-200 p-6 z-50"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
          <div>
            <h3 className="font-semibold text-sm">Analyzing Code</h3>
            <p className="text-xs text-gray-500">{currentStep}</p>
          </div>
        </div>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="space-y-2">
        <Progress value={progress} className="h-2" />
        <p className="text-xs text-gray-500">{progress}% complete</p>
      </div>

      <div className="mt-4 text-xs space-y-1 text-gray-600">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${progress > 10 ? "bg-green-500" : "bg-gray-300"}`} />
          <span>Preparing</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${progress > 30 ? "bg-green-500" : progress > 10 ? "bg-yellow-500" : "bg-gray-300"}`} />
          <span>Sending to AI</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${progress > 70 ? "bg-green-500" : progress > 30 ? "bg-yellow-500" : "bg-gray-300"}`} />
          <span>Processing</span>
        </div>
      </div>
    </motion.div>
  );
}

export default AIAnalysisProgress;
