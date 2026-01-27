"use client";

import React from "react";
import type { Repo } from "@/types/Repo";

interface RepoCardProps {
  repo: Repo;
  toggleAutoAudit: (repoName: string) => Promise<void>;
  addToCheck: (repo: Repo) => Promise<void>;
}

const RepoCard: React.FC<RepoCardProps> = ({ repo, toggleAutoAudit, addToCheck }) => {
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [isAdding, setIsAdding] = React.useState(false);

  const handleToggle = async () => {
    setIsUpdating(true);
    try {
      await toggleAutoAudit(repo.name);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddToCheck = async () => {
    setIsAdding(true);
    try {
      await addToCheck(repo);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 basis-full min-h-55 lg:basis-[31%] hover:shadow-sm transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-base">{repo.name}</h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToggle}
            disabled={isUpdating}
            className={`px-3 py-1 text-xs rounded-full border transition
              ${repo.auto_audit ? "bg-green-500 text-white" : "bg-gray-100 text-gray-600"}
              ${isUpdating ? "opacity-50 cursor-not-allowed" : "hover:bg-opacity-80"}
            `}
          >
            {repo.auto_audit ? "Auto audit ON" : "Auto audit OFF"}
          </button>
        </div>
      </div>

      <p className="mt-2 line-clamp-2 text-sm text-gray-500">
        {repo.description || "No description provided"}
      </p>

      <div className="mt-4 flex items-center gap-4 text-sm">
        <span className="text-red-600 font-medium">
          {repo.issues} issues found
        </span>
        <span className="text-gray-500">
          Last scan: {repo.lastScan}
        </span>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-gray-400" />
          <span className="text-sm text-gray-600">{repo.language}</span>
        </div>

        <button
          onClick={handleAddToCheck}
          disabled={isAdding}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition
            ${isAdding
              ? "bg-gray-300 text-gray-600 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"}
          `}
        >
          {isAdding ? "Adding..." : "Add to check"}
        </button>
      </div>
    </div>
  );
};

export default RepoCard;
