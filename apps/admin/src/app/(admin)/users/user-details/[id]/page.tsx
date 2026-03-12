"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useUserStore } from "@/store/userStore";
import SpinnerLoad from "@/components/Spinner";


export default function UserDetails() {
  const { fetchUserDetails, user , banUser , unbanUser } = useUserStore();
  const params = useParams();
  const id = params?.id as string;

  useEffect(() => {
    if (id) {
      fetchUserDetails(Number(id));
    }
  }, [id, fetchUserDetails]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-black">
        <SpinnerLoad />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black px-10 py-10">
      <div className="max-w-7xl mx-auto space-y-12">

        <div className="flex items-center gap-6 border-b pb-8">
          <img
            src={user.avatarUrl || "https://i.pravatar.cc/200"}
            className="w-24 h-24 rounded-full border"
          />
          <div>
            <h1 className="text-3xl font-semibold">{user.username}</h1>
            <p className="text-gray-500">{user.email}</p>
            <p className="text-sm mt-2">{user.role}</p>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-6">Repositories Actives</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {user.repos?.map((repo) => (
              <div
                key={repo.id}
                className="border rounded-xl p-6 hover:shadow-lg transition"
              >
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold">{repo.name}</h3>
                  <span className="text-xs border px-2 py-1 rounded">
                    {repo.language || "Unknown"}
                  </span>
                </div>

                <p className="text-sm text-gray-500 mb-4">
                  {repo.description || "No description"}
                </p>

                <a
                  href={repo.htmlUrl}
                  target="_blank"
                  className="text-sm underline"
                >
                  Open Repository
                </a>

                <div className="mt-6 space-y-4">
                  {repo.commits?.slice(0, 3).map((commit) => (
                    <div
                      key={commit.id}
                      className="border rounded-lg p-4 bg-gray-50"
                    >
                      <p className="font-medium">{commit.message}</p>

                      <div className="text-xs text-gray-500 mt-1 flex justify-between">
                        <span>{commit.author}</span>
                        <span>
                          {new Date(commit.date).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="mt-3 space-y-2">
                        {commit.files?.map((file) => (
                          <div
                            key={file.id}
                            className="text-xs border px-3 py-2 rounded bg-white"
                          >
                            {file.path}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            ))}
          </div>
        </div>

      </div>
      <div className="mt-4 flex gap-4">
  {user.isBanned ? (
    <button
      onClick={() => unbanUser(user.id)}
      className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
    >
      Unban User
    </button>
  ) : (
    <button
      onClick={() => banUser(user.id)}
      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
    >
      Ban User
    </button>
  )}
</div>
    </div>
  );
}