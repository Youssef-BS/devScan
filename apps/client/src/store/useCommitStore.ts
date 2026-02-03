import { create } from "zustand";
import { fetchCommitsFromGitHub, getAllCommits , getCommitDetails } from "@/lib/api/commit";
import { Commit } from "@/types/Commit";

interface CommitStore {
  commits: Commit[];
  loading: boolean;
  commitFiles: { path: string; content: string }[];
  error: string | null;
  fetchAndLoadCommits: (githubId: string) => Promise<void>;
  loadCommitsFromDB: (githubId: string) => Promise<void>;
  loadCommitDetails: (sha: string) => Promise<void>;
}

export const useCommitStore = create<CommitStore>((set) => ({
  commits: [],
  loading: false,
  commitFiles: [],
  error: null,

  fetchAndLoadCommits: async (githubId: string) => {
    set({ loading: true, error: null });

    try {
      await fetchCommitsFromGitHub(githubId); 
      const commits = await getAllCommits(githubId); 

      if (!commits || commits.length === 0) {
        set({ commits: [], loading: false, error: "No commits found" });
        return;
      }

      set({ commits, loading: false });
    } catch (err: any) {
      set({ loading: false, error: err.message || "Failed to fetch commits" });
    }
  },

  loadCommitsFromDB: async (githubId: string) => {
    set({ loading: true, error: null });

    try {
      const commits = await getAllCommits(githubId);
      if (!commits || commits.length === 0) {
        set({ commits: [], loading: false, error: "No commits found" });
        return;
      }
      set({ commits, loading: false });
    } catch (err: any) {
      set({ loading: false, error: err.message || "Failed to load commits" });
    }
  },

    loadCommitDetails: async (sha: string) => {
    set({ loading: true, error: null, commitFiles: [] });
    try {
      const files = await getCommitDetails(sha);
      set({ commitFiles: files, loading: false });
    } catch (err: any) {
      set({ loading: false, error: err.message });
    }
  },
  
}));
