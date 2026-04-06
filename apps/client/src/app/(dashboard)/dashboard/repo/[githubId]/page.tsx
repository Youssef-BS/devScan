"use client"
import React, { useEffect } from "react";
import { useParams } from "next/navigation";
import { useRepoStore } from "@/store/useRepoStore";
import { useCommitStore } from "@/store/useCommitStore";
import { useAuthContext } from "@/auth-context";
import SpinnerLoad from "@/components/Spinner";
import AIChatbot from "@/components/AIChatbot";
import { CollaborationPanel } from "@/components/collaboration";
import Link from "next/link";
import CommitCard from "@/components/cards/CommitCard";
import { 
  CalendarDays, 
  User, 
  GitCommit, 
  MessageSquare,
  Code,
  ChevronRight,
  ExternalLink,
  GitBranch,
  Clock,
  TrendingUp,
  BarChart3,
  Activity
} from "lucide-react";

const RepoDetailsPage = () => {
  const { getRepoDetails, repoDetails, loading: repoLoading } = useRepoStore();
  const {
    commits,
    loading: commitsLoading,
    error: commitsError,
    fetchAndLoadCommits,
  } = useCommitStore();
  const { user } = useAuthContext();

  const params = useParams();
  const githubId = typeof params.githubId === "string" ? params.githubId : "";

  useEffect(() => {
    if (!githubId) return;
    getRepoDetails(githubId);
  }, [githubId, getRepoDetails]);

  useEffect(() => {
    if (!githubId) return;
    fetchAndLoadCommits(githubId);
  }, [githubId, fetchAndLoadCommits]);

  const lastCommit = commits[0];
  const isOwner = repoDetails && user ? repoDetails.ownerId === user.id : false;

  if (repoLoading || commitsLoading) {
    return <SpinnerLoad />;
  }

  if (!repoDetails) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
          <Code className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-xl font-semibold text-gray-800">Repository not found</h2>
        <p className="text-gray-500">The requested repository could not be loaded</p>
        <Link 
          href="/dashboard"
          className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex flex-col lg:flex-row gap-6 p-4 md:p-6 max-w-full">
        
        <div className="flex-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8 hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="space-y-4 flex-1">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                    <Code className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                      {repoDetails.name}
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">ID: {repoDetails.githubId}</p>
                  </div>
                </div>
                
                <p className="text-gray-600 text-base leading-relaxed">
                  {repoDetails.description || "No description provided"}
                </p>
                
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  {repoDetails.language && (
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold border border-blue-100">
                      <Code className="w-4 h-4" />
                      {repoDetails.language}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-1">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 p-4">
                  <p className="text-gray-600 text-xs font-semibold uppercase tracking-wide mb-1">Total Commits</p>
                  <p className="text-3xl font-bold text-gray-900">{commits.length}</p>
                </div>
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 p-4">
                  <p className="text-gray-600 text-xs font-semibold uppercase tracking-wide mb-1">Last Update</p>
                  <p className="text-lg font-bold text-gray-900">
                    {lastCommit ? new Date(lastCommit.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-semibold mb-1">Commits</p>
                  <p className="text-2xl font-bold text-gray-900">{commits.length}</p>
                </div>
                <div className="p-3 rounded-lg bg-blue-50">
                  <GitCommit className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-semibold mb-1">Repository</p>
                  <p className="text-2xl font-bold text-gray-900">Active</p>
                </div>
                <div className="p-3 rounded-lg bg-indigo-50">
                  <Code className="w-5 h-5 text-indigo-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-semibold mb-1">Collaboration</p>
                  <p className="text-2xl font-bold text-gray-900">Enabled</p>
                </div>
                <div className="p-3 rounded-lg bg-purple-50">
                  <MessageSquare className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {commitsError && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex items-start gap-4">
              <MessageSquare className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-amber-800 font-medium">{commitsError}</p>
            </div>
          )}

          {lastCommit && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <GitCommit className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-bold text-gray-900">Latest Activity</h2>
              </div>
              <CommitCard commit={lastCommit} />
            </div>
          )}

          {!lastCommit && !commitsError && (
            <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center hover:shadow-md transition-shadow">
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <GitCommit className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">No commits yet</h3>
              <p className="text-gray-500">This repository doesn't have any commits yet</p>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 overflow-hidden hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-bold text-gray-900">Analytics</h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <p className="text-gray-600 text-xs font-semibold uppercase tracking-wide mb-2">Code Frequency</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-gray-900">{commits.length}</span>
                  <span className="text-xs text-gray-500">changes</span>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <p className="text-gray-600 text-xs font-semibold uppercase tracking-wide mb-2">Contributors</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-gray-900">
                    {new Set(commits.map(c => c.author)).size}
                  </span>
                  <span className="text-xs text-gray-500">members</span>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <p className="text-gray-600 text-xs font-semibold uppercase tracking-wide mb-2">Activity</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-gray-900">Active</span>
                </div>
              </div>
            </div>
          </div>

          {commits.length > 1 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GitCommit className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-bold text-gray-900">All Commits</h2>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold">
                    {commits.length}
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50">
                        <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">Commit</th>
                        <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">Author</th>
                        <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                        <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {commits.map((commit) => (
                        <tr 
                          key={commit.sha} 
                          className="hover:bg-gray-50 transition-colors group"
                        >
                          <td className="py-4 px-6">
                            <Link href={`/dashboard/commits/${commit.sha}`}>
                              <div className="space-y-1 cursor-pointer">
                                <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                                  {commit.message}
                                </p>
                                <p className="font-mono text-xs text-gray-500 flex items-center gap-2">
                                  <GitCommit className="w-3 h-3" />
                                  {commit.sha.substring(0, 8)}
                                </p>
                              </div>
                            </Link>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                                {commit.author.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-gray-700 text-sm">{commit.author}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2 text-gray-600 text-sm">
                              <Clock className="w-4 h-4" />
                              {new Date(commit.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <Link href={`/dashboard/commits/${commit.sha}`}>
                              <button className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors cursor-pointer border border-gray-200">
                                View
                                <ExternalLink className="w-3 h-3" />
                              </button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="w-full lg:w-96 flex-shrink-0 flex flex-col gap-6">
          <div className="sticky top-6 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden h-[calc(100vh-120px)] flex flex-col">
            <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex-shrink-0">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                Team Collaboration
              </h3>
            </div>
            <div className="flex-1 overflow-hidden flex flex-col">
              <CollaborationPanel
                repoId={repoDetails.id}
                repoName={repoDetails.name}
                isOwner={isOwner}
                currentUserId={user?.id}
              />
            </div>
          </div>
          <AIChatbot 
            repoId={repoDetails.id}
            codeContext={`Repository: ${repoDetails.name}\n${repoDetails.description || ''}`} 
          />
        </div>
      </div>
    </div>
  );
};

export default RepoDetailsPage;