"use client";

import { useEffect } from "react";
import { useCommitStore } from "@/store/useCommitStore";
import { useParams } from "next/navigation";

const CommitDetails = () => {
  const { sha } = useParams<{ sha: string }>();
  const { commitFiles, loadCommitDetails, loading, error } = useCommitStore();

  useEffect(() => {
    if (sha) {
      loadCommitDetails(sha);
    }
  }, [sha, loadCommitDetails]);

  if (loading) return <p>Loading commit details...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Commit Details</h1>

      {commitFiles.length === 0 && (
        <p>No files found for this commit.</p>
      )}

      {commitFiles.map((file) => (
        <div
          key={file.path}
          className="border rounded-md overflow-hidden"
        >
          <div className="bg-gray-100 px-4 py-2 font-mono text-sm">
            {file.path}
          </div>

          <pre className="p-4 overflow-x-auto text-sm bg-black text-green-200">
            <code>{file.content}</code>
          </pre>
        </div>
      ))}
    </div>
  );
};

export default CommitDetails;
