"use client";

import { Repo } from "@/types/Repo";
import { useRepoStore } from "@/store/repo.store";
import { 
  Github, 
  Code2, 
  Lock, 
  GitFork,
  Star,
  Clock,
  ExternalLink,
  Trash2,
  AlertCircle,
  Database,
  Globe
} from "lucide-react";
import { useState } from "react";

interface Props {
  repo: Repo;
  viewMode?: "grid" | "list";
}

export default function RepoCard({ repo, viewMode = "grid" }: Props) {
  const { removeRepo } = useRepoStore();
  const [isHovered, setIsHovered] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = () => {
    if (showDeleteConfirm) {
      removeRepo(repo.githubId);
    } else {
      setShowDeleteConfirm(true);
      setTimeout(() => setShowDeleteConfirm(false), 3000);
    }
  };

  if (viewMode === "list") {
    return (
      <div 
        className="bg-white border border-gray-200 rounded-xl hover:shadow-lg transition-all duration-200 overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="p-4 flex items-center gap-4">
          <div className={`p-2 rounded-lg transition-colors ${
            isHovered ? 'bg-gray-900' : 'bg-gray-100'
          }`}>
            <Github size={20} className={isHovered ? 'text-white' : 'text-gray-700'} />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {repo.name}
              </h3>
              <div className="flex items-center gap-2">
                {repo.private && (
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full border border-gray-200">
                    <Lock size={10} />
                    Private
                  </span>
                )}
                {repo.fork && (
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full border border-gray-200">
                    <GitFork size={10} />
                    Fork
                  </span>
                )}
              </div>
            </div>
            
            {repo.description && (
              <p className="text-sm text-gray-500 truncate max-w-2xl">
                {repo.description}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            {repo.language && (
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Code2 size={14} className="text-gray-400" />
                <span>{repo.language}</span>
              </div>
            )}
            
            <a
              href={repo.htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <ExternalLink size={14} />
              View
            </a>
            
            <button
              onClick={handleDelete}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-all duration-200 ${
                showDeleteConfirm
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-red-50 hover:text-red-500 hover:border-red-200'
              }`}
            >
              <Trash2 size={14} />
              {showDeleteConfirm ? 'Confirm?' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="group bg-white border border-gray-200 rounded-xl hover:shadow-xl transition-all duration-200 overflow-hidden flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`h-2 transition-colors duration-200 ${
        isHovered ? 'bg-gray-900' : 'bg-gray-200'
      }`} />
      
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-start justify-between mb-3">
          <div className={`p-2 rounded-lg transition-colors ${
            isHovered ? 'bg-gray-900' : 'bg-gray-100'
          }`}>
            <Github size={20} className={isHovered ? 'text-white' : 'text-gray-700'} />
          </div>
          
          <div className="flex gap-1">
            {repo.private && (
              <span className="p-1 bg-gray-100 rounded" title="Private">
                <Lock size={14} className="text-gray-600" />
              </span>
            )}
            {repo.fork && (
              <span className="p-1 bg-gray-100 rounded" title="Fork">
                <GitFork size={14} className="text-gray-600" />
              </span>
            )}
          </div>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors">
          {repo.name}
        </h3>
        <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">
          {repo.description || "No description provided"}
        </p>

        <div className="space-y-3 mb-4">
          {repo.language && (
            <div className="flex items-center gap-2 text-sm">
              <Code2 size={14} className="text-gray-400" />
              <span className="text-gray-700">{repo.language}</span>
            </div>
          )}
          
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <a
            href={repo.htmlUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors group/link"
          >
            <span>View</span>
            <ExternalLink size={14} className="group-hover/link:translate-x-0.5 transition-transform" />
          </a>

          <button
            onClick={handleDelete}
            className={`flex items-center gap-1 text-sm transition-all duration-200 ${
              showDeleteConfirm
                ? 'text-red-500 font-medium'
                : 'text-gray-400 hover:text-red-500'
            }`}
          >
            <Trash2 size={14} />
            {showDeleteConfirm ? 'Click to confirm' : 'Delete'}
          </button>
        </div>
        {showDeleteConfirm && (
          <div className="mt-2 text-xs text-red-500 flex items-center gap-1 animate-pulse">
            <AlertCircle size={12} />
            Click again to confirm
          </div>
        )}
      </div>
    </div>
  );
}