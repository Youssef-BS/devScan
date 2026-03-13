import { create } from "zustand";
import type { Repo, Pagination, CreateRepoPayload } from "@/types/Repo";
import {
  fetchAllRepos,
  createRepo,
  deleteRepo,
} from "@/services/repo.service";

interface RepoState {
  repos: Repo[] | null;
  pagination: Pagination | null;
  loading: boolean;
  error: string | null;

  fetchRepos: (page?: number) => Promise<void>;
  addRepo: (data: CreateRepoPayload) => Promise<void>;
  removeRepo: (githubId: string) => Promise<void>;
}

export const useRepoStore = create<RepoState>((set) => ({
  repos: null,
  pagination: null,
  loading: false,
  error: null,

  fetchRepos: async (page = 1) => {
    try {
      set({ loading: true, error: null });

      const res = await fetchAllRepos(page);

      set({
        repos: res.data,
        pagination: res.pagination,
        loading: false,
      });
    } catch (err: any) {
      set({
        error: err.message,
        loading: false,
      });
    }
  },

  addRepo: async (data) => {
    try {
      set({ loading: true });

      await createRepo(data);

      const res = await fetchAllRepos();

      set({
        repos: res.data,
        pagination: res.pagination,
        loading: false,
      });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  removeRepo: async (githubId) => {
    try {
      set({ loading: true });

      await deleteRepo(githubId);

      set((state) => ({
        repos: state.repos?.filter((r) => r.githubId !== githubId) || [],
        loading: false,
      }));
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },
}));