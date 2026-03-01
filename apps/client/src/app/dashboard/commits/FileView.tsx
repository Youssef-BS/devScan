"use client";

import React from "react";
import CommitFileAnalysis from "@/components/CommitFileAnalysis";
import { Bot } from "lucide-react";

export interface FileItem {
  sha: string;
  path: string;
  status: string;
  additions: number;
  deletions: number;
  changes: number;
  patch?: string;
}

interface FileViewProps {
  files: FileItem[];

  addedFiles: number;
  modifiedFiles: number;
  removedFiles: number;

  activeFileIndex: number | null;

  analysisLoading: boolean;
  analysisResult: any;

  fullCommitAnalysis: any;
  setFullCommitAnalysis: (value: any) => void;

  handleAnalyzeFile: (
    index: number,
    path: string,
    patch: string
  ) => Promise<void>;

  renderPatch: (patch: string) => React.ReactNode;
}

const FileView = ({
  files,
  addedFiles,
  modifiedFiles,
  removedFiles,
  activeFileIndex,
  analysisLoading,
  analysisResult,
  fullCommitAnalysis,
  setFullCommitAnalysis,
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

      <div className="bg-white p-8 rounded-2xl border shadow-md">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Stat label="Added" value={`+${addedFiles}`} />
          <Stat label="Modified" value={`~${modifiedFiles}`} />
          <Stat label="Removed" value={`-${removedFiles}`} />
          <Stat label="Total" value={files.length} />
        </div>
      </div>
      {files.map((file, index) => (
        <div
          key={file.sha + index}
          className="bg-white rounded-2xl border shadow-md overflow-hidden"
        >
          <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
            <div>
              <span className="px-2 py-1 text-xs bg-gray-200 rounded font-semibold">
                {file.status.toUpperCase()}
              </span>
              <code className="ml-3 font-mono text-sm">
                {file.path}
              </code>
            </div>

            <button
              onClick={() =>
                handleAnalyzeFile(index, file.path, file.patch ?? "")
              }
              disabled={analysisLoading && activeFileIndex === index}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm hover:bg-gray-900 flex items-center gap-2"
            >
              <Bot className="w-4 h-4" />
              Analyze
            </button>
          </div>
          <div className="max-h-96 overflow-y-auto bg-gray-50">
            {file.patch ? (
              renderPatch(file.patch)
            ) : (
              <div className="p-6 text-center text-gray-500">
                No patch available
              </div>
            )}
          </div>
          {activeFileIndex === index && analysisResult && (
            <div className="border-t p-4 bg-gray-50">
              <CommitFileAnalysis
                fileName={file.path}
                analysis={analysisResult.analysis || ""}
                correctedExamples={analysisResult.correctedExamples || []}
                loading={analysisLoading}
                onClose={() => {}}
              />
            </div>
          )}
        </div>
      ))}
      {fullCommitAnalysis && (
        <div className="bg-white p-6 rounded-2xl border shadow-md">
          <div className="flex justify-between mb-4">
            <h3 className="font-bold text-lg">
              Full Commit Analysis
            </h3>
            <button
              onClick={() => setFullCommitAnalysis(null)}
            >
              Close
            </button>
          </div>

          <div className="bg-gray-50 p-4 rounded font-mono text-sm whitespace-pre-wrap">
            {fullCommitAnalysis.analysis || "Analyzing..."}
          </div>
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