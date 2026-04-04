"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Download, X } from "lucide-react";
import { toast } from "sonner";

interface AIAnalysisResultsProps {
  analysis: string;
  correctedExamples: string[];
  onClose: () => void;
  score?: number;
  grade?: string;
}

export function AIAnalysisResults({
  analysis,
  correctedExamples,
  onClose,
  score,
  grade
}: AIAnalysisResultsProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const downloadResults = () => {
    const content = `Analysis Results\n${"=".repeat(50)}\n\n${analysis}\n\n${
      correctedExamples.length > 0
        ? `Suggested Fixes:\n${"-".repeat(50)}\n${correctedExamples.join("\n\n")}`
        : ""
    }`;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analysis-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    toast.success("Results downloaded");
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {/* Score Card */}
      {(score !== undefined || grade) && (
        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Analysis Score</p>
                  <p className="text-3xl font-bold">{score}/100</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">Grade</p>
                  <p className="text-4xl font-bold text-blue-600">{grade}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Analysis Card */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle>Analysis Results</CardTitle>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(analysis)}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
              <Button size="sm" variant="ghost" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none dark:prose-invert max-h-96 overflow-y-auto">
              <pre className="bg-gray-50 p-4 rounded-lg text-sm whitespace-pre-wrap break-word">
                {analysis}
              </pre>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Corrected Examples */}
      {correctedExamples.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Suggested Fixes ({correctedExamples.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {correctedExamples.map((example, idx) => (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  className="bg-green-50 border border-green-200 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <Badge variant="outline" className="bg-green-100">
                      Fix {idx + 1}
                    </Badge>
                    <button
                      onClick={() => copyToClipboard(example)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <pre className="bg-white p-3 rounded border border-green-200 text-xs overflow-x-auto">
                    {example}
                  </pre>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Download Button */}
      <motion.div variants={itemVariants}>
        <Button
          onClick={downloadResults}
          className="w-full"
          variant="outline"
        >
          <Download className="w-4 h-4 mr-2" />
          Download Results
        </Button>
      </motion.div>
    </motion.div>
  );
}

export default AIAnalysisResults;
