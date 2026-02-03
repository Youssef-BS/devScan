"use client";

import React, { useEffect } from "react";
import { useParams } from "next/navigation";
import { useRepoStore } from "@/store/useRepoStore";
import { useCommitStore } from "@/store/useCommitStore";
import SpinnerLoad from "@/components/Spinner";
import Link from "next/link";

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
    return (
       <SpinnerLoad />
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
          <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">
            {repoDetails.language}
          </span>
        )}
        <p className="text-sm text-gray-500">Repo ID: {repoDetails.githubId}</p>
      </div>

      {commitsError && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <p className="text-yellow-700">{commitsError}</p>
        </div>
      )}

      {lastCommit ? (
       <Link href={`/dashboard/commits/${lastCommit.sha}`} key={lastCommit.sha}> <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
          <h2 className="font-semibold text-lg mb-3">Latest Commit</h2>
          <p><strong>SHA:</strong> {lastCommit.sha}</p>
          <p><strong>Message:</strong> {lastCommit.message}</p>
          <p><strong>Author:</strong> {lastCommit.author}</p>
          <p><strong>Date:</strong> {new Date(lastCommit.date).toLocaleString()}</p>
        </div> </Link>
      ) : (
        !commitsError && (
          <p className="text-center text-gray-500">No commits found</p>
        )
      )}

      {commits.length > 1 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">All Commits ({commits.length})</h2>
<ul className="space-y-3">
  {commits.map((c) => (
    <Link href={`/dashboard/commits/${c.sha}`} key={c.sha}>
      <li className="bg-white border border-gray-200 rounded-xl p-4 hover:bg-gray-50 cursor-pointer transition">
        <p className="truncate text-sm text-gray-500 mb-1">
          <strong>SHA:</strong> {c.sha.substring(0, 8)}...
        </p>

        <p className="mb-2">
          <strong>Message:</strong> {c.message}
        </p>

        <div className="flex justify-between text-sm text-gray-600">
          <span>
            <strong>Author:</strong> {c.author}
          </span>
          <span>{new Date(c.date).toLocaleString()}</span>
        </div>
      </li>
    </Link>
  ))}
</ul>

        </div>
      )}
    </div>
  );
};

export default RepoDetailsPage;
