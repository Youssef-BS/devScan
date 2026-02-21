"use client"

import React from "react";
import { Zap, AlertCircle, CheckCircle, XCircle, Loader } from "lucide-react";

interface AIAnalysisPanelProps {
  analysis: string;
  loading?: boolean;
  error?: string | null;
  onAnalyzeClick?: () => void;
}

const AIAnalysisPanel: React.FC<AIAnalysisPanelProps> = ({
  analysis,
  loading = false,
  error = null,
  onAnalyzeClick,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">AI Analysis</h2>
            <p className="text-sm text-gray-500">Smart code insights & suggestions</p>
          </div>
        </div>
        {onAnalyzeClick && (
          <button
            onClick={onAnalyzeClick}
            disabled={loading}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Analyze Again
              </>
            )}
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-900">Analysis Error</p>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
              <Loader className="w-6 h-6 text-purple-600 animate-spin" />
            </div>
            <p className="text-gray-600 font-medium">Analyzing code with AI...</p>
            <p className="text-sm text-gray-500 mt-2">This may take a few seconds</p>
          </div>
        </div>
      )}

      {analysis && !loading && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-900">Insights</span>
              </div>
              <p className="text-xs text-green-700">Code quality analysis complete</p>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Suggestions</span>
              </div>
              <p className="text-xs text-blue-700">Ready for review</p>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">AI Powered</span>
              </div>
              <p className="text-xs text-purple-700">Advanced analysis</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3">Analysis Results</h3>
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {analysis}
              </p>
            </div>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-700">
              💡 <span className="font-medium">Tip:</span> Use the chat assistant below to ask specific questions about this analysis.
            </p>
          </div>
        </div>
      )}

      {!analysis && !loading && !error && (
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Analysis Yet</h3>
          <p className="text-gray-600 mb-4">Click the "Analyze" button to get AI insights about this commit</p>
          {onAnalyzeClick && (
            <button
              onClick={onAnalyzeClick}
              className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all duration-300"
            >
              Start Analysis
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default AIAnalysisPanel;
