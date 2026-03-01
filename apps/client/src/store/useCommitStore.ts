import { create } from "zustand";
import { fetchCommitsFromGitHub, getAllCommits, getCommitDetails } from "@/lib/api/commit";
import type { CommitDetails } from "@/types/Commit";
import type { Commit } from "@/types/Commit";

interface CommitStore {
  commits: Commit[];
  loading: boolean;
  commitDetails: CommitDetails | null;
  error: string | null;
  fetchAndLoadCommits: (githubId: string) => Promise<void>;
  loadCommitsFromDB: (githubId: string) => Promise<void>;
  loadCommitDetails: (sha: string) => Promise<void>;
  clearCommitDetails: () => void;
  clearError: () => void;
}

export const useCommitStore = create<CommitStore>((set) => ({
  commits: [],
  loading: false,
  commitDetails: null,
  error: null,

  fetchAndLoadCommits: async (githubId: string) => {
    set({ loading: true, error: null });

    try {
      console.log("Fetching and loading commits for repo:", githubId);
      await fetchCommitsFromGitHub(githubId); 
      const commits = await getAllCommits(githubId); 

      if (!commits || commits.length === 0) {
        set({ commits: [], loading: false, error: "No commits found" });
        return;
      }

      set({ commits, loading: false, error: null });
      console.log(`Loaded ${commits.length} commits`);
    } catch (err: any) {
      console.error("Error fetching commits:", err);
      set({ loading: false, error: err.message || "Failed to fetch commits" });
    }
  },

  loadCommitsFromDB: async (githubId: string) => {
    set({ loading: true, error: null });

    try {
      console.log("Loading commits from DB for repo:", githubId);
      const commits = await getAllCommits(githubId);
      
      if (!commits || commits.length === 0) {
        set({ commits: [], loading: false, error: "No commits found" });
        return;
      }
      
      set({ commits, loading: false, error: null });
      console.log(`Loaded ${commits.length} commits from DB`);
    } catch (err: any) {
      console.error("Error loading commits from DB:", err);
      set({ loading: false, error: err.message || "Failed to load commits" });
    }
  },

  loadCommitDetails: async (sha: string) => {
    set({ loading: true, error: null, commitDetails: null });
    
    try {
      console.log("Loading commit details for SHA:", sha);
      const details = await getCommitDetails(sha);
      
      if (!details || !details.files || details.files.length === 0) {
        set({ 
          loading: false, 
          error: "No file changes found for this commit",
          commitDetails: null
        });
        return;
      }
      
      set({ 
        commitDetails: details, 
        loading: false,
        error: null
      });
      console.log(`Loaded ${details.files.length} file changes for commit ${sha}`);
    } catch (err: any) {
      console.error("Error loading commit details:", err);
      set({ 
        loading: false, 
        error: err.message || "Failed to load commit details",
        commitDetails: null
      });
    }
  },
  
  clearCommitDetails: () => {
    set({ commitDetails: null });
  },
  
  clearError: () => {
    set({ error: null });
  }
}));