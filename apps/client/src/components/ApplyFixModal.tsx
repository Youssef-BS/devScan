"use client";

import React, { useEffect, useState } from "react";
import { X, Loader, GitPullRequest, GitCommit, CheckCircle, ExternalLink, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { ScanIssue } from "@/types/AnalyseResult";
import { getFileContent, applyFix } from "@/services/pr.service";

interface ApplyFixModalProps {
  repoGithubId: string;
  issue: ScanIssue;
  onClose: () => void;
}

export default function ApplyFixModal({ repoGithubId, issue, onClose }: ApplyFixModalProps) {
  const [originalContent, setOriginalContent] = useState<string>("");
  const [editedContent,   setEditedContent]   = useState<string>("");
  const [fetchLoading,    setFetchLoading]     = useState(true);
  const [fetchError,      setFetchError]       = useState<string | null>(null);
  const [commitMsg,       setCommitMsg]        = useState(`fix: AI suggestion for ${issue.filePath}`);
  const [prTitle,         setPrTitle]          = useState(`AI Fix: ${issue.title}`);
  const [submitting,      setSubmitting]       = useState<"push" | "pr" | null>(null);
  const [done,            setDone]             = useState<{ type: "push" | "pr"; url?: string; prNumber?: number } | null>(null);

  // Fetch the full file from GitHub when the modal opens
  useEffect(() => {
    if (!issue.filePath || issue.filePath === "unknown") {
      setFetchLoading(false);
      setFetchError("File path is unknown — paste the full file content manually.");
      return;
    }

    setFetchLoading(true);
    getFileContent(repoGithubId, issue.filePath)
      .then(({ content }) => {
        setOriginalContent(content);
        setEditedContent(content);
        setFetchLoading(false);
      })
      .catch((err) => {
        setFetchError(err.message);
        setFetchLoading(false);
      });
  }, [repoGithubId, issue.filePath]);

  async function handleSubmit(createPR: boolean) {
    if (!editedContent.trim()) {
      toast.error("File content cannot be empty");
      return;
    }

    setSubmitting(createPR ? "pr" : "push");
    try {
      const result = await applyFix(repoGithubId, {
        filePath:      issue.filePath,
        newContent:    editedContent,
        commitMessage: commitMsg,
        createPR,
        prTitle:       createPR ? prTitle : undefined,
        prBody:        createPR
          ? `**DevScan AI Fix**\n\n**Issue:** ${issue.title}\n**Severity:** ${issue.severity}\n**File:** \`${issue.filePath}\`\n\n${issue.message || ""}`
          : undefined,
      });

      setDone({
        type:     result.type,
        url:      result.prUrl ?? result.commitUrl,
        prNumber: result.prNumber,
      });

      toast.success(
        result.type === "pr"
          ? `Pull Request #${result.prNumber} created!`
          : "Fix pushed to main branch!",
      );
    } catch (err: any) {
      toast.error(err.message || "Failed to apply fix");
    } finally {
      setSubmitting(null);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Apply AI Fix</h2>
            <p className="text-xs text-gray-500 font-mono mt-0.5 truncate max-w-md">{issue.filePath}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Done state */}
        {done ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-5 p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-9 h-9 text-green-600" />
            </div>
            <div>
              <p className="text-xl font-semibold text-gray-800">
                {done.type === "pr" ? `PR #${done.prNumber} created!` : "Pushed to main!"}
              </p>
              <p className="text-sm text-gray-500 mt-1">The fix has been applied to your repository.</p>
            </div>
            {done.url && (
              <a
                href={done.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                {done.type === "pr" ? "View Pull Request" : "View Commit"}
              </a>
            )}
            <button onClick={onClose} className="text-sm text-gray-500 underline hover:text-gray-700">
              Close
            </button>
          </div>
        ) : (
          <div className="flex flex-1 overflow-hidden divide-x divide-gray-200">

            {/* LEFT — file editor */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  File Editor
                </span>
                {fetchLoading && <Loader className="w-3.5 h-3.5 text-gray-400 animate-spin" />}
              </div>

              {fetchLoading ? (
                <div className="flex-1 flex items-center justify-center gap-3 text-gray-500">
                  <Loader className="w-5 h-5 animate-spin" />
                  <span className="text-sm">Fetching file from GitHub…</span>
                </div>
              ) : fetchError ? (
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="px-4 py-2 bg-yellow-50 border-b border-yellow-200 flex items-center gap-2 text-xs text-yellow-700">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {fetchError}
                  </div>
                  <textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    placeholder="Paste the full file content here…"
                    className="flex-1 p-4 font-mono text-xs resize-none focus:outline-none"
                    spellCheck={false}
                  />
                </div>
              ) : (
                <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="flex-1 p-4 font-mono text-xs resize-none focus:outline-none overflow-auto"
                  spellCheck={false}
                />
              )}
            </div>

            {/* RIGHT — AI suggestion + actions */}
            <div className="w-80 flex flex-col overflow-hidden bg-gray-50">
              {/* AI fix snippet */}
              <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200">
                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  AI Suggested Fix
                </span>
              </div>
              <div className="flex-1 overflow-auto p-3">
                <pre className="bg-green-50 border border-green-200 rounded-lg p-3 text-xs font-mono whitespace-pre-wrap break-words text-gray-800">
                  {issue.fixedCode}
                </pre>
                <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                  Copy the fix above into the editor on the left (or the editor already shows the full file — locate and replace the problematic section).
                </p>
              </div>

              {/* Commit message */}
              <div className="p-3 border-t border-gray-200 space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Commit message</label>
                  <input
                    type="text"
                    value={commitMsg}
                    onChange={(e) => setCommitMsg(e.target.value)}
                    className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">PR title (for Create PR)</label>
                  <input
                    type="text"
                    value={prTitle}
                    onChange={(e) => setPrTitle(e.target.value)}
                    className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>

                {/* Action buttons */}
                <button
                  onClick={() => handleSubmit(false)}
                  disabled={!!submitting || fetchLoading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-700 text-white text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {submitting === "push"
                    ? <><Loader className="w-4 h-4 animate-spin" />Pushing…</>
                    : <><GitCommit className="w-4 h-4" />Push to main</>}
                </button>

                <button
                  onClick={() => handleSubmit(true)}
                  disabled={!!submitting || fetchLoading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {submitting === "pr"
                    ? <><Loader className="w-4 h-4 animate-spin" />Creating PR…</>
                    : <><GitPullRequest className="w-4 h-4" />Create Pull Request</>}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
