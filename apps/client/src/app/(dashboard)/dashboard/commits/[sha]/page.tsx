"use client";

import { useEffect, useState } from "react";
import { useCommitStore } from "@/store/useCommitStore";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import AIChatbot from "@/components/AIChatbot";
import AIAnalysisProgress from "@/components/AIAnalysisProgress";
import IssuesPanel from "@/components/IssuesPanel";
import { useAIAnalysis } from "@/hooks/useAIAnalysis";
import { Zap, Kanban, File, User, Clock, Files, RefreshCcwDot, Loader } from "lucide-react";
import Overview from "../Overview";
import FileView from "../FileView";
import { AnalysisResult } from "@/types/AnalyseResult";

const CommitDetailsPage = () => {
  const { sha } = useParams<{ sha: string }>();
  const router  = useRouter();

  const { commitDetails, loadCommitDetails, loading, error, clearError } = useCommitStore();
  const {
    analyzeCode,
    cancelAnalysis,
    loading: analysisLoading,
    error:   analysisError,
    progress,
    currentStep,
    status,
  } = useAIAnalysis();

  const [activeTab,            setActiveTab]            = useState<"files" | "overview" | "ai">("files");
  const [codeContent,          setCodeContent]          = useState("");
  const [activeFileIndex,      setActiveFileIndex]      = useState<number | null>(null);
  const [fileAnalyses,         setFileAnalyses]         = useState<Record<number, AnalysisResult>>({});
  const [fullCommitAnalysis,   setFullCommitAnalysis]   = useState<AnalysisResult | null>(null);
  const [aiTabResult,          setAiTabResult]          = useState<AnalysisResult | null>(null);
  const [aiTabLoading,         setAiTabLoading]         = useState(false);

  // ── Load commit details ────────────────────────────────────────────────
  useEffect(() => {
    if (sha) loadCommitDetails(sha);
    return () => clearError();
  }, [sha, loadCommitDetails, clearError]);

  useEffect(() => {
    if (!commitDetails?.files) return;
    const allCode = commitDetails.files
      .map((f: any) => `\n\n--- File: ${f.path} (${f.status}) ---\n${f.patch || "// Binary file"}`)
      .join("\n");
    setCodeContent(allCode);
  }, [commitDetails]);

  // ── Handlers ──────────────────────────────────────────────────────────

  /** Analyze a single file — FIX: use the returned value, not stale state */
  const handleAnalyzeFile = async (fileIndex: number, filePath: string, patch: string) => {
    setActiveFileIndex(fileIndex);
    const ctx  = `File: ${filePath}\n\n${patch || "// Binary file"}`;
    const data = await analyzeCode(ctx, sha, "file_fix");
    if (data) {
      setFileAnalyses((prev) => ({ ...prev, [fileIndex]: data as AnalysisResult }));
    }
  };

  /** Analyze all files — FIX: use the returned value, not stale state */
  const handleAnalyzeAllFiles = async () => {
    if (!commitDetails) return;

    const allFilesCtx = commitDetails.files
      .map((f: any, i: number) =>
        `\n${"=".repeat(60)}\nFile ${i + 1}: ${f.path} (${f.status})\n${"-".repeat(60)}\n${f.patch || "// Binary file"}`,
      )
      .join("\n");

    const ctx = `Commit: ${commitDetails.commitInfo.message}
Author: ${commitDetails.commitInfo.author}
Date: ${commitDetails.commitInfo.date}
Files changed: ${commitDetails.files.length}
${allFilesCtx}`;

    const data = await analyzeCode(ctx, sha, "commit");
    if (data) setFullCommitAnalysis(data as AnalysisResult);
  };

  /** AI tab — full-commit analysis */
  const handleAnalyzeWithAI = async () => {
    if (!codeContent) return;
    setAiTabLoading(true);
    const data = await analyzeCode(codeContent, sha, "audit");
    if (data) setAiTabResult(data as AnalysisResult);
    setAiTabLoading(false);
  };

  // ── Utility ───────────────────────────────────────────────────────────

  const formatDate = (d: string) =>
    new Date(d).toLocaleString("en-US", {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

  const renderPatch = (patch: string) => {
    if (!patch) return null;
    if (patch.startsWith("//") && patch.includes("Binary")) {
      return (
        <div className="p-6 text-center text-yellow-600 bg-yellow-50">
          <p className="font-semibold">{patch.split("\n")[2]}</p>
          <p className="text-sm mt-1">Binary file — no text diff available</p>
        </div>
      );
    }
    return patch.split("\n").map((line, i) => {
      let bg = "bg-transparent", fg = "text-gray-800";
      if (line.startsWith("+"))  { bg = "bg-green-50";  fg = "text-green-700"; }
      else if (line.startsWith("-"))  { bg = "bg-red-50";    fg = "text-red-700";   }
      else if (line.startsWith("@@")) { bg = "bg-blue-50";   fg = "text-blue-700";  }
      else if (line.startsWith("diff"))  bg = "bg-gray-100";
      else if (line.startsWith("index")) bg = "bg-gray-50";
      else if (line.startsWith("//"))  { bg = "bg-purple-50"; fg = "text-purple-700"; }
      return (
        <div key={i} className={`${bg} ${fg} px-4 py-0.5 font-mono text-sm`}>
          <span className="inline-block w-8 text-gray-400 text-right pr-2 select-none">{i + 1}</span>
          <span className="pl-2">{line}</span>
        </div>
      );
    });
  };

  // ── Loading / error states ─────────────────────────────────────────────

  if (loading) return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-64" />
        <div className="grid grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => <div key={i} className="h-32 bg-gray-200 rounded" />)}
        </div>
        {[1, 2, 3].map((i) => <div key={i} className="h-48 bg-gray-200 rounded" />)}
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-xl border border-red-200 p-6">
        <h2 className="text-xl font-semibold text-red-600 mb-3">Error Loading Commit</h2>
        <p className="text-red-800 mb-4">{error}</p>
        <div className="flex gap-3">
          <button onClick={() => loadCommitDetails(sha)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium flex items-center gap-2">
            <RefreshCcwDot className="w-4 h-4" /> Retry
          </button>
          <button onClick={() => router.back()}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium">
            ← Go Back
          </button>
        </div>
      </div>
    </div>
  );

  if (!commitDetails) return (
    <div className="min-h-screen bg-gray-50 p-6 text-center">
      <p className="text-gray-500 text-lg">No commit data available.</p>
    </div>
  );

  const totalAdditions = commitDetails.files.reduce((s: number, f: any) => s + f.additions, 0);
  const totalDeletions = commitDetails.files.reduce((s: number, f: any) => s + f.deletions, 0);
  const addedFiles     = commitDetails.files.filter((f: any) => f.status === "added").length;
  const modifiedFiles  = commitDetails.files.filter((f: any) => f.status === "modified").length;
  const removedFiles   = commitDetails.files.filter((f: any) => f.status === "removed").length;
  const repoGithubId   = commitDetails.commitInfo.repoGithubId;

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-white">
      <div className="relative z-10 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">

          {/* ── Commit header ────────────────────────────────────────────── */}
          <div className="mb-8">
            <Link href="/dashboard"
              className="inline-flex items-center px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all mb-6 border border-gray-300">
              ← Back to Repositories
            </Link>

            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
                <div className="flex-1 min-w-0">
                  <h1 className="text-3xl font-bold text-gray-800 mb-4 wrap-break-word">
                    {commitDetails.commitInfo.message}
                  </h1>
                  <div className="flex flex-wrap gap-6 text-gray-600">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Author</p>
                        <p className="font-semibold text-gray-800">{commitDetails.commitInfo.author}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center">
                        <Clock className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Date</p>
                        <p className="font-semibold text-gray-800">{formatDate(commitDetails.commitInfo.date)}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Commit SHA</p>
                  <code className="bg-gray-100 px-4 py-2 rounded-lg text-sm font-mono text-gray-800 border border-gray-300">
                    {sha.substring(0, 12)}
                  </code>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-gray-200">
                {[
                  ["Files Changed", commitDetails.files.length],
                  ["Additions",     `+${totalAdditions}`],
                  ["Deletions",     `-${totalDeletions}`],
                  ["Net Change",    `${totalAdditions - totalDeletions > 0 ? "+" : ""}${totalAdditions - totalDeletions}`],
                ].map(([label, val]) => (
                  <div key={label as string} className="p-4 rounded-xl bg-gray-50">
                    <p className="text-gray-500 text-sm uppercase tracking-wider mb-1">{label}</p>
                    <p className="text-3xl font-bold text-gray-800">{val}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Tab bar ───────────────────────────────────────────────────── */}
          <div className="mb-6">
            <div className="bg-white rounded-t-2xl border border-gray-200 border-b-0 p-4 shadow-sm">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <nav className="flex gap-1">
                  {(["files", "overview", "ai"] as const).map((tab) => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                      className={`px-5 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 text-sm ${
                        activeTab === tab
                          ? "bg-gray-800 text-white shadow"
                          : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                      }`}>
                      {tab === "files"    && <><File className="w-4 h-4" />Files ({commitDetails.files.length})</>}
                      {tab === "overview" && <><Kanban className="w-4 h-4" />Overview</>}
                      {tab === "ai"       && <><Zap className="w-4 h-4" />AI Analysis{aiTabResult && " ✓"}</>}
                    </button>
                  ))}
                </nav>

                {activeTab === "files" && (
                  <button onClick={handleAnalyzeAllFiles}
                    disabled={analysisLoading}
                    className="px-5 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-900 text-white font-medium text-sm transition-all disabled:opacity-50 flex items-center gap-2 shadow">
                    {analysisLoading
                      ? <><Loader className="w-4 h-4 animate-spin" />Analyzing…</>
                      : <><Files className="w-4 h-4" />Analyze All Files</>}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ── Tab content ───────────────────────────────────────────────── */}

          {activeTab === "files" && (
            <FileView
              files={commitDetails.files}
              addedFiles={addedFiles}
              modifiedFiles={modifiedFiles}
              removedFiles={removedFiles}
              activeFileIndex={activeFileIndex}
              analysisLoading={analysisLoading}
              fileAnalyses={fileAnalyses}
              fullCommitAnalysis={fullCommitAnalysis}
              setFullCommitAnalysis={setFullCommitAnalysis}
              repoGithubId={repoGithubId}
              handleAnalyzeFile={handleAnalyzeFile}
              renderPatch={renderPatch}
            />
          )}

          {activeTab === "overview" && (
            <Overview
              addedFiles={addedFiles}
              modifiedFiles={modifiedFiles}
              removedFiles={removedFiles}
              totalAdditions={totalAdditions}
              totalDeletions={totalDeletions}
              commitDetails={commitDetails}
            />
          )}

          {activeTab === "ai" && (
            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm space-y-6">
              {/* Action bar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">AI Analysis</h2>
                    <p className="text-sm text-gray-500">Security · Performance · Clean Code</p>
                  </div>
                </div>
                <button
                  onClick={handleAnalyzeWithAI}
                  disabled={aiTabLoading || analysisLoading}
                  className="px-5 py-2.5 rounded-xl bg-linear-to-r from-purple-500 to-pink-500 text-white font-medium text-sm hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {aiTabLoading
                    ? <><Loader className="w-4 h-4 animate-spin" />Analyzing…</>
                    : <><Zap className="w-4 h-4" />{aiTabResult ? "Re-analyze" : "Analyze Commit"}</>}
                </button>
              </div>

              {/* Error */}
              {analysisError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                  <strong>Analysis Error:</strong> {analysisError}
                </div>
              )}

              {/* Results */}
              {aiTabResult ? (
                <IssuesPanel
                  result={aiTabResult}
                  repoGithubId={repoGithubId}
                  onClose={() => setAiTabResult(null)}
                />
              ) : !aiTabLoading && (
                <div className="text-center py-16">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-lg font-medium text-gray-700 mb-2">No analysis yet</p>
                  <p className="text-sm text-gray-500 mb-6">
                    Click "Analyze Commit" to run a full security, performance, and clean-code audit.
                  </p>
                </div>
              )}

              {/* Chatbot */}
              <AIChatbot codeContext={codeContent} isOpen onClose={() => {}} />
            </div>
          )}

          {/* Global progress overlay */}
          <AIAnalysisProgress
            progress={progress}
            currentStep={currentStep}
            onCancel={cancelAnalysis}
            isVisible={status === "analyzing" || status === "processing"}
          />
        </div>
      </div>
    </div>
  );
};

export default CommitDetailsPage;
