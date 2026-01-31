"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useRepoStore } from "@/store/useRepoStore";
import { getLastCommit } from "@/lib/api/commit";

const Page = () => {
  const { getRepoDetails, repoDetails, loading } = useRepoStore();
  const [lastCommit, setLastCommit] = useState<any>(null);
  const params = useParams();

  const githubId = typeof params.githubId === "string" ? params.githubId : "";

  // Fetch repo details
  useEffect(() => {
    if (!githubId) return;
    getRepoDetails(githubId);
  }, [githubId, getRepoDetails]);

  // Fetch last commit
  useEffect(() => {
    const fetchCommit = async () => {
      if (!githubId) return;
      const commit = await getLastCommit(githubId);
      setLastCommit(commit);
      console.log("Last commit:", commit);
    };
    fetchCommit();
  }, [githubId]);

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
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <h1 className="text-2xl font-bold">{repoDetails.name}</h1>
        <p className="text-gray-600">{repoDetails.description || "No description"}</p>
        {repoDetails.language && (
          <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">{repoDetails.language}</span>
        )}
      </div>

      {lastCommit && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
          <h2 className="font-semibold text-lg">Last Commit</h2>
          <p>
            <strong>SHA:</strong> {lastCommit.sha}
          </p>
          <p>
            <strong>Message:</strong> {lastCommit.message}
          </p>
          <p>
            <strong>Author:</strong> {lastCommit.author}
          </p>
          <p>
            <strong>Date:</strong> {new Date(lastCommit.date).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
};

export default Page;
