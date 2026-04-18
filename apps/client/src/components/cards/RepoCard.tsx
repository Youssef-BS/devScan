"use client";

import React from "react";
import type { Repo } from "@/types/Repo";
import { usePathname, useRouter } from "next/navigation";
import { GitBranch, AlertCircle, Clock, Zap } from "lucide-react";

interface RepoCardProps {
  repo: Repo;
  toggleAutoAudit: (repoName: string) => Promise<void>;
  addToCheck: (repo: Repo) => Promise<void>;
}

const LANG_COLORS: Record<string, string> = {
  TypeScript: "bg-blue-500",
  JavaScript: "bg-yellow-400",
  Python: "bg-green-500",
  Java: "bg-orange-500",
  Go: "bg-cyan-500",
  Rust: "bg-orange-700",
  "C++": "bg-pink-500",
  C: "bg-gray-500",
  Ruby: "bg-red-500",
  PHP: "bg-purple-500",
};

const RepoCard: React.FC<RepoCardProps> = ({ repo, toggleAutoAudit, addToCheck }) => {
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [isAdding, setIsAdding] = React.useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleToggle = async () => {
    setIsUpdating(true);
    try { await toggleAutoAudit(repo.name); }
    finally { setIsUpdating(false); }
  };

  const handleAddToCheck = async () => {
    setIsAdding(true);
    try { await addToCheck(repo); }
    finally { setIsAdding(false); }
  };

  const langColor = LANG_COLORS[repo.language] ?? "bg-gray-400";
  const hasIssues = repo.issues > 0;

  return (
    <div className="group relative flex flex-col bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/[0.07] rounded-xl p-5 hover:border-gray-300 dark:hover:border-white/[0.14] hover:shadow-lg hover:shadow-black/[0.04] dark:hover:shadow-black/30 transition-all duration-200 basis-full lg:basis-[calc(33.333%-14px)]">

      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-white/[0.06]">
            <GitBranch size={15} className="text-gray-500 dark:text-gray-400" />
          </div>
          <h2 className="font-semibold text-sm text-gray-900 dark:text-white truncate">
            {repo.name}
          </h2>
        </div>

        {/* Auto-audit badge */}
        <button
          onClick={handleToggle}
          disabled
          className={`shrink-0 flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded-full border transition-colors ${
            repo.auto_audit
              ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400"
              : "bg-gray-50 dark:bg-white/[0.04] border-gray-200 dark:border-white/[0.08] text-gray-500 dark:text-gray-400"
          }`}
        >
          <Zap size={10} className={repo.auto_audit ? "fill-current" : ""} />
          {repo.auto_audit ? "Auto-audit" : "Manual"}
        </button>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed mb-4 flex-1">
        {repo.description || "No description provided."}
      </p>

      {/* Stats row */}
      <div className="flex items-center gap-4 text-xs mb-4">
        <span className={`flex items-center gap-1 font-medium ${
          hasIssues
            ? "text-red-600 dark:text-red-400"
            : "text-emerald-600 dark:text-emerald-400"
        }`}>
          <AlertCircle size={12} />
          {hasIssues ? `${repo.issues} issues` : "No issues"}
        </span>
        {repo.lastScan && (
          <span className="flex items-center gap-1 text-gray-400 dark:text-gray-500">
            <Clock size={12} />
            {repo.lastScan}
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-white/[0.06]">
        <div className="flex items-center gap-1.5">
          <span className={`h-2 w-2 rounded-full ${langColor}`} />
          <span className="text-xs text-gray-500 dark:text-gray-400">{repo.language || "Unknown"}</span>
        </div>

        {pathname === "/dashboard" ? (
          <button
            onClick={handleAddToCheck}
            disabled={repo.auto_audit || isAdding}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              repo.auto_audit
                ? "bg-gray-100 dark:bg-white/[0.06] text-gray-400 dark:text-gray-500 cursor-not-allowed"
                : "bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-200 cursor-pointer"
            }`}
          >
            {isAdding ? "Adding…" : repo.auto_audit ? "Already queued" : "Add to queue"}
          </button>
        ) : (
          <button
            onClick={() => router.push(`/dashboard/repo/${repo.githubId}`)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-200 transition-all cursor-pointer"
          >
            View details
          </button>
        )}
      </div>
    </div>
  );
};

export default RepoCard;
