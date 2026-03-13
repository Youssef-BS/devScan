"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useUserStore } from "@/store/user.store";
import SpinnerLoad from "@/components/Spinner";
import { 
  Github, 
  Mail, 
  User, 
  Shield, 
  Calendar,
  Code2,
  GitCommit,
  FileCode2,
  ExternalLink,
  Ban,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Star,
  GitFork
} from "lucide-react";

export default function UserDetails() {
  const { fetchUserDetails, user, banUser, unbanUser } = useUserStore();
  const params = useParams();
  const id = params?.id as string;
  const [expandedRepos, setExpandedRepos] = useState<Set<number>>(new Set());
  const [expandedCommits, setExpandedCommits] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (id) {
      fetchUserDetails(Number(id));
    }
  }, [id, fetchUserDetails]);

  const toggleRepo = (repoId: number) => {
    setExpandedRepos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(repoId)) {
        newSet.delete(repoId);
      } else {
        newSet.add(repoId);
      }
      return newSet;
    });
  };

  const toggleCommit = (commitId: string) => {
    setExpandedCommits(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commitId)) {
        newSet.delete(commitId);
      } else {
        newSet.add(commitId);
      }
      return newSet;
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center space-y-4">
          <SpinnerLoad />
          <p className="text-gray-500 animate-pulse">Loading user details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-8">
            <div className="relative">
              <img
                src={user.avatarUrl || "https://i.pravatar.cc/200"}
                alt={user.username}
                className="w-24 h-24 rounded-full border-2 border-gray-200 object-cover"
              />
              <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-white ${
                user.isBanned ? 'bg-red-500' : 'bg-green-500'
              }`} />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{user.username}</h1>
                {user.isBanned ? (
                  <span className="flex items-center gap-1 px-3 py-1 bg-red-50 text-red-700 text-sm font-medium rounded-full border border-red-200">
                    <Ban size={14} />
                    Banned
                  </span>
                ) : (
                  <span className="flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 text-sm font-medium rounded-full border border-green-200">
                    <CheckCircle size={14} />
                    Active
                  </span>
                )}
              </div>
              
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Mail size={16} className="text-gray-400" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Shield size={16} className="text-gray-400" />
                  <span className="capitalize">{user.role}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar size={16} className="text-gray-400" />
                  <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Ban/Unban Button */}
            <div className="flex items-center">
              {user.isBanned ? (
                <button
                  onClick={() => unbanUser(user.id)}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
                >
                  <CheckCircle size={18} />
                  Unban User
                </button>
              ) : (
                <button
                  onClick={() => banUser(user.id)}
                  className="flex items-center gap-2 px-6 py-3 bg-white text-gray-900 border-2 border-gray-900 rounded-xl hover:bg-gray-900 hover:text-white transition-all duration-200 font-medium shadow-md hover:shadow-lg"
                >
                  <Ban size={18} />
                  Ban User
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white rounded-xl border border-gray-200">
                <Github size={24} className="text-gray-700" />
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Repositories</p>
                <p className="text-3xl font-bold text-gray-900">{user.repos?.length || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white rounded-xl border border-gray-200">
                <GitCommit size={24} className="text-gray-700" />
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Commits</p>
                <p className="text-3xl font-bold text-gray-900">
                  {user.repos?.reduce((acc, repo) => acc + (repo.commits?.length || 0), 0)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white rounded-xl border border-gray-200">
                <Code2 size={24} className="text-gray-700" />
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Languages Used</p>
                <p className="text-3xl font-bold text-gray-900">
                  {new Set(user.repos?.map(repo => repo.language).filter(Boolean)).size}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Repositories Section */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Repositories</h2>
            <p className="text-sm text-gray-500">Most recent activity shown</p>
          </div>

          <div className="grid gap-6">
            {user.repos?.map((repo) => (
              <div
                key={repo.id}
                className="border border-gray-200 rounded-2xl bg-white hover:shadow-lg transition-all duration-200 overflow-hidden"
              >
                {/* Repository Header */}
                <div 
                  className="p-6 cursor-pointer"
                  onClick={() => toggleRepo(repo.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Github size={20} className="text-gray-400" />
                        <h3 className="text-xl font-semibold text-gray-900">{repo.name}</h3>
                        {repo.language && (
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full border border-gray-200">
                            {repo.language}
                          </span>
                        )}
                      </div>
                      
                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {repo.description || "No description provided"}
                      </p>
                      
                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <GitCommit size={14} />
                          <span>{repo.commits?.length || 0} commits</span>
                        </div>
                        {repo.updatedAt && (
                          <div className="flex items-center gap-1">
                            <Clock size={14} />
                            <span>Updated {new Date(repo.updatedAt).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <a
                        href={repo.htmlUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink size={16} />
                        View on GitHub
                      </a>
                      
                      <button className="text-gray-400 hover:text-gray-600 transition-colors">
                        {expandedRepos.has(repo.id) ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Commits Section (Expandable) */}
                {expandedRepos.has(repo.id) && (
                  <div className="border-t border-gray-200 bg-gray-50 p-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                      <GitCommit size={16} />
                      Recent Commits
                    </h4>
                    
                    <div className="space-y-4">
                      {repo.commits?.slice(0, 5).map((commit) => (
                        <div
                          key={commit.id}
                          className="border border-gray-200 rounded-xl bg-white overflow-hidden"
                        >
                          {/* Commit Header */}
                          <div 
                            className="p-4 cursor-pointer"
                            onClick={() => toggleCommit(commit.id)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <GitCommit size={16} className="text-gray-400" />
                                  <p className="font-medium text-gray-900">{commit.message}</p>
                                </div>
                                
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <User size={12} />
                                    {commit.author}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Calendar size={12} />
                                    {new Date(commit.date).toLocaleString()}
                                  </span>
                                </div>
                              </div>
                              
                              <button className="text-gray-400 hover:text-gray-600">
                                {expandedCommits.has(commit.id) ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                              </button>
                            </div>
                          </div>

                          {/* Files Section (Expandable) */}
                          {expandedCommits.has(commit.id) && commit.files && commit.files.length > 0 && (
                            <div className="border-t border-gray-200 bg-gray-50 p-4">
                              <h5 className="text-xs font-medium text-gray-500 mb-3 flex items-center gap-1">
                                <FileCode2 size={12} />
                                Modified Files ({commit.files.length})
                              </h5>
                              
                              <div className="space-y-2">
                                {commit.files.map((file) => (
                                  <div
                                    key={file.id}
                                    className="flex items-center gap-2 text-xs px-3 py-2 bg-white border border-gray-200 rounded-lg"
                                  >
                                    <FileCode2 size={14} className="text-gray-400" />
                                    <code className="text-gray-700 font-mono flex-1 truncate">
                                      {file.path}
                                    </code>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    {repo.commits && repo.commits.length > 5 && (
                      <button className="mt-4 text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
                        View all {repo.commits.length} commits
                        <ChevronDown size={14} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {(!user.repos || user.repos.length === 0) && (
            <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-200">
              <Github size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No repositories found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}