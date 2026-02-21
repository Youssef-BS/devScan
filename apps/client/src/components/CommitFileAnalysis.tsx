"use client";

import React from "react";
import { Copy, Check } from "lucide-react";

interface FileAnalysisResult {
  analysis: string;
  suggestedFixes?: string;
  issues?: string[];
}

interface CommitFileAnalysisProps {
  fileName: string;
  analysis: string;
  loading?: boolean;
  onClose?: () => void;
}

const CommitFileAnalysis: React.FC<CommitFileAnalysisProps> = ({
  fileName,
  analysis,
  loading = false,
  onClose = () => {},
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(analysis);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const parseAnalysis = (text: string) => {
    // Split analysis into sections if it follows a pattern
    const sections: { title: string; content: string }[] = [];
    const lines = text.split("\n");
    let currentSection = "";
    let currentContent = "";

    lines.forEach((line) => {
      if (
        line.startsWith("##") ||
        line.startsWith("###") ||
        line.match(/^[A-Z][^:]+:$/)
      ) {
        if (currentSection) {
          sections.push({
            title: currentSection,
            content: currentContent.trim(),
          });
        }
        currentSection = line.replace(/^#+\s*/, "").replace(/:$/, "");
        currentContent = "";
      } else {
        currentContent += line + "\n";
      }
    });

    if (currentSection) {
      sections.push({
        title: currentSection,
        content: currentContent.trim(),
      });
    }

    return sections.length > 0 ? sections : null;
  };

  const sections = parseAnalysis(analysis);

  const getIssueColor = (issue: string): string => {
    const lowerCase = issue.toLowerCase();
    if (lowerCase.includes("vulnerability") || lowerCase.includes("security")) {
      return "border-red-200 bg-red-50";
    }
    if (lowerCase.includes("performance") || lowerCase.includes("optimization")) {
      return "border-yellow-200 bg-yellow-50";
    }
    if (lowerCase.includes("best practice") || lowerCase.includes("suggestion")) {
      return "border-blue-200 bg-blue-50";
    }
    return "border-gray-200 bg-gray-50";
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border-2 border-purple-200">
      {/* Header */}
      <div className="bg-purple-600 text-white p-4 rounded-t-lg flex justify-between items-center">
        <div>
          <h3 className="font-bold text-lg">🤖 AI Analysis</h3>
          <p className="text-sm text-purple-100 truncate">{fileName}</p>
        </div>
        <button
          onClick={handleCopy}
          className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          title="Copy analysis"
        >
          {copied ? (
            <Check className="w-5 h-5" />
          ) : (
            <Copy className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Content */}
      <div className="p-6 max-h-96 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin">
              <svg
                className="h-8 w-8 text-purple-600"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
            <span className="ml-3 text-gray-600">Analyzing code...</span>
          </div>
        ) : sections ? (
          <div className="space-y-4">
            {sections.map((section, idx) => (
              <div key={idx} className={`p-4 rounded-lg border ${getIssueColor(section.title)}`}>
                <h4 className="font-semibold text-gray-900 mb-2">
                  {section.title}
                </h4>
                <div className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                  {section.content}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-700 whitespace-pre-wrap font-mono text-sm leading-relaxed">
            {analysis}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t bg-gray-50 p-4 rounded-b-lg flex justify-between items-center">
        <span className="text-xs text-gray-500">
          Analysis powered by AI (Ollama)
        </span>
        <button
          onClick={onClose}
          className="px-3 py-1 text-sm bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default CommitFileAnalysis;
