"use client";

import React from "react";
import { Bot, Loader } from "lucide-react";
import IssuesPanel from "@/components/IssuesPanel";
import { AnalysisResult } from "@/types/AnalyseResult";

export interface FileItem {
  sha: string;
  path: string;
  status: string;
  additions: number;
  deletions: number;
  changes?: number;
  patch?: string;
}

interface FileViewProps {
  files: FileItem[];
  addedFiles: number;
  modifiedFiles: number;
  removedFiles: number;

  activeFileIndex: number | null;
  analysisLoading: boolean;
  /** Per-file analysis results keyed by file index */
  fileAnalyses: Record<number, AnalysisResult>;
  /** Full-commit analysis (from "Analyze All Files" button) */
  fullCommitAnalysis: AnalysisResult | null;
  setFullCommitAnalysis: (v: AnalysisResult | null) => void;

  repoGithubId?: string;

  handleAnalyzeFile: (index: number, path: string, patch: string) => Promise<void>;
  renderPatch: (patch: string) => React.ReactNode;
}

const FileView = ({
  files,
  addedFiles,
  modifiedFiles,
  removedFiles,
  activeFileIndex,
  analysisLoading,
  fileAnalyses,
  fullCommitAnalysis,
  setFullCommitAnalysis,
  repoGithubId,
  handleAnalyzeFile,
  renderPatch,
}: FileViewProps) => {
  if (!files || files.length === 0) {
    return (
      <div className="bg-white p-8 rounded-2xl border shadow-md text-center">
        <p className="text-gray-500">No files found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary stats */}
      <div className="bg-white p-8 rounded-2xl border shadow-md">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Stat label="Added"    value={`+${addedFiles}`}    />
          <Stat label="Modified" value={`~${modifiedFiles}`} />
          <Stat label="Removed"  value={`-${removedFiles}`}  />
          <Stat label="Total"    value={files.length}        />
        </div>
      </div>

      {/* File cards */}
      {files.map((file, index) => {
        const isAnalyzing = analysisLoading && activeFileIndex === index;
        const result      = fileAnalyses[index] ?? null;

        return (
          <div
            key={file.sha + index}
            className="bg-white rounded-2xl border shadow-md overflow-hidden"
          >
            {/* File header */}
            <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
              <div className="flex items-center gap-3 min-w-0">
                <span className="px-2 py-1 text-xs bg-gray-200 rounded font-semibold shrink-0">
                  {file.status.toUpperCase()}
                </span>
                <code className="font-mono text-sm truncate">{file.path}</code>
              </div>

              <button
                onClick={() => handleAnalyzeFile(index, file.path, file.patch ?? "")}
                disabled={isAnalyzing}
                className="shrink-0 ml-4 px-4 py-2 bg-gray-800 text-white rounded-lg text-sm hover:bg-gray-900 flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {isAnalyzing ? (
                  <><Loader className="w-4 h-4 animate-spin" />Analyzing…</>
                ) : (
                  <><Bot className="w-4 h-4" />Analyze</>
                )}
              </button>
            </div>

            {/* Diff view */}
            <div className="max-h-80 overflow-y-auto bg-gray-50">
              {file.patch ? renderPatch(file.patch) : (
                <div className="p-6 text-center text-gray-500 text-sm">
                  No patch available
                </div>
              )}
            </div>

            {/* Per-file analysis results */}
            {result && (
              <div className="border-t p-5">
                <IssuesPanel
                  result={result}
                  repoGithubId={repoGithubId}
                  onClose={() => {/* individual file results stay until re-analyzed */}}
                />
              </div>
            )}
          </div>
        );
      })}

      {/* Full-commit analysis results */}
      {fullCommitAnalysis && (
        <div className="bg-white p-6 rounded-2xl border shadow-md">
          <IssuesPanel
            result={fullCommitAnalysis}
            repoGithubId={repoGithubId}
            onClose={() => setFullCommitAnalysis(null)}
          />
        </div>
      )}
    </div>
  );
};

const Stat = ({ label, value }: { label: string; value: string | number }) => (
  <div className="p-4 rounded-xl bg-gray-50 border">
    <p className="text-gray-500 text-sm uppercase mb-2">{label}</p>
    <p className="text-2xl font-bold text-gray-800">{value}</p>
  </div>
);

export default FileView;
