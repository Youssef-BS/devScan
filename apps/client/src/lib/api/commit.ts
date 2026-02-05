const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
import type { CommitFile } from "@/types/CommitFile";



export interface CommitDetails {
  message: string;
  files: CommitFile[];
  commitInfo: {
    sha: string;
    message: string;
    author: string;
    date: string;
    totalChanges: number;
  };
}

export const fetchCommitsFromGitHub = async (githubId: string): Promise<any> => {
  try {
    const res = await fetch(`${API_BASE_URL}/github/commit/fetch/${githubId}`, {
      credentials: 'include',
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to fetch commits: ${errorText}`);
    }
    
    return await res.json();
  } catch (err: any) {
    console.error("Error fetching commits from GitHub:", err);
    throw err;
  }
};

export const getAllCommits = async (githubId: string): Promise<any[]> => {
  try {
    const res = await fetch(`${API_BASE_URL}/github/commit/repo/${githubId}`, {
      credentials: 'include',
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to get commits: ${errorText}`);
    }
    
    return await res.json();
  } catch (err: any) {
    console.error(" Error getting commits from DB:", err);
    throw err;
  }
};

export const getCommitDetails = async (sha: string): Promise<CommitDetails> => {
  try {
    console.log("🔍 Fetching commit details for SHA:", sha);
    
    const res = await fetch(`${API_BASE_URL}/github/commit/details/${sha}`, {
      credentials: "include",
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`HTTP ${res.status}: ${errorText}`);
      throw new Error(`Failed to fetch commit details: ${errorText}`);
    }

    const data = await res.json();
    console.log("Commit details response received");
    
    return data;
  } catch (err: any) {
    console.error("Error fetching commit details:", err);
    throw err;
  }
};