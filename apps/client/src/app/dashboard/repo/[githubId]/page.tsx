"use client"
import React, { useEffect } from "react";
import { useParams } from "next/navigation";
import { useRepoStore } from "@/store/useRepoStore";
import { useCommitStore } from "@/store/useCommitStore";
import SpinnerLoad from "@/components/Spinner";
import Link from "next/link";
import { 
  CalendarDays, 
  User, 
  GitCommit, 
  MessageSquare,
  Code,
  ChevronRight,
  ExternalLink,
  GitBranch,
  Clock
} from "lucide-react";

const RepoDetailsPage = () => {
  const { getRepoDetails, repoDetails, loading: repoLoading } = useRepoStore();
  const {
    commits,
    loading: commitsLoading,
    error: commitsError,
    fetchAndLoadCommits,
  } = useCommitStore();

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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-4 flex-1">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <Code className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                    {repoDetails.name}
                  </h1>
                  <p className="text-gray-500 mt-1">Repo ID: {repoDetails.githubId}</p>
                </div>
              </div>
              
              <p className="text-gray-600 text-lg leading-relaxed">
                {repoDetails.description || "No description provided"}
              </p>
              
              {repoDetails.language && (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                    {repoDetails.language}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Total Commits</p>
                <p className="text-2xl font-bold text-gray-900">{commits.length}</p>
              </div>
            </div>
          </div>
        </div>
        {commitsError && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-amber-800">{commitsError}</p>
          </div>
        )}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <GitCommit className="w-5 h-5" />
            Latest Commit
          </h2>
          
          {lastCommit ? (
            <Link href={`/dashboard/commits/${lastCommit.sha}`}>
              <div className="group bg-gradient-to-br from-gray-900 to-black rounded-2xl p-6 text-white hover:shadow-2xl transition-all duration-300 cursor-pointer">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold">{lastCommit.author}</p>
                      <p className="text-sm text-gray-300">Author</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:translate-x-2 transition-transform" />
                </div>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-300 mb-1">Commit Message</p>
                    <p className="text-lg font-medium">{lastCommit.message}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center">
                        <GitBranch className="w-4 h-4 text-gray-300" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-300">SHA</p>
                        <p className="font-mono text-sm">{lastCommit.sha.substring(0, 12)}...</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center">
                        <CalendarDays className="w-4 h-4 text-gray-300" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-300">Date</p>
                        <p className="text-sm">{new Date(lastCommit.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ) : (
            !commitsError && (
              <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <GitCommit className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No commits found</h3>
                <p className="text-gray-500">This repository doesn't have any commits yet</p>
              </div>
            )
          )}
        </div>

        {commits.length > 1 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <GitCommit className="w-5 h-5" />
                All Commits
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                  {commits.length}
                </span>
              </h2>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Commit</th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Author</th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Date</th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Actions</th>
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
                              <p className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                                {commit.message}
                              </p>
                              <p className="font-mono text-sm text-gray-500 flex items-center gap-2">
                                <GitCommit className="w-3 h-3" />
                                {commit.sha.substring(0, 8)}
                              </p>
                            </div>
                          </Link>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-gray-200 to-gray-300 flex items-center justify-center">
                              <User className="w-4 h-4 text-gray-600" />
                            </div>
                            <span className="text-gray-700">{commit.author}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Clock className="w-4 h-4" />
                            {new Date(commit.date).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <Link href={`/dashboard/commits/${commit.sha}`}>
                            <button className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors cursor-pointer">
                              View Details
                              <ExternalLink className="w-4 h-4" />
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
    </div>
  );
};

export default RepoDetailsPage;