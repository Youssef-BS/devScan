"use client";

import React from "react";
import type {CommitFileCardProps} from "@/types/Commit";


const CommitFileCard: React.FC<CommitFileCardProps> = ({ file, index } : CommitFileCardProps) => {
  const getStatusSymbol = () => {
    switch (file.status) {
      case "added":
        return "+";
      case "removed":
        return "−";
      case "renamed":
        return "↻";
      default:
        return "~";
    }
  };

  const scrollToDetails = () => {
    document
      .getElementById(`file-detail-${index}`)
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div
      onClick={scrollToDetails}
      className="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer group border-l-4 border-l-transparent hover:border-l-gray-800 hover:pl-5"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm bg-gray-200 text-gray-700">
            {getStatusSymbol()}
          </div>
          <div className="flex-1 min-w-0">
            <code
              className="text-gray-800 font-mono text-sm break-all group-hover:text-gray-600 transition-colors"
              title={file.path}
            >
              {file.path}
            </code>
            <p className="text-xs text-gray-500 mt-1 capitalize">
              {file.status}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 shrink-0 text-sm">
          <div className="text-right">
            <p className="text-gray-800 font-semibold">+{file.additions}</p>
            <p className="text-gray-800 font-semibold">-{file.deletions}</p>
          </div>

          <svg
            className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default CommitFileCard;