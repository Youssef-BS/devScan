"use client";

import React, { useEffect } from "react";
import { useParams } from "next/navigation";
import { useRepoStore } from "@/store/useRepoStore";

const Page = () => {
  const { getRepoDetails, repoDetails, loading } = useRepoStore();
  const params = useParams();

  const githubId =
    typeof params.githubId === "string" ? params.githubId : undefined;

  useEffect(() => {
    if (!githubId) return;
    getRepoDetails(githubId);
  }, [githubId, getRepoDetails]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="text-gray-500 text-lg">Loading repository...</span>
      </div>
    );
  }

  if (!repoDetails) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="text-red-500 text-lg">Repository not found</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {repoDetails.name}
          </h1>
          <p className="text-gray-600 mt-1">
            {repoDetails.description || "No description provided"}
          </p>
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-gray-700">
          {repoDetails.language && (
            <span className="px-3 py-1 bg-gray-100 rounded-full">
              {repoDetails.language}
            </span>
          )}

        </div>
      </div>
    </div>
  );
};

export default Page;
