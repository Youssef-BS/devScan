import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Repo } from '@/types/Repo';
import { mockRepos } from '@/data/repos.mock';

interface RepoStore {
  repos: Repo[];
  search: string;
  language: string;
  setRepos: (repos: Repo[]) => void;
  setSearch: (value: string) => void;
  setLanguage: (value: string) => void;
  toggleAutoAudit: (repoName: string) => void;
}

export const useRepoStore = create<RepoStore>()(
  persist(
    (set) => ({
      repos: mockRepos, 
      search: '',
      language: 'all',
      setRepos: (repos: Repo[]) => set({ repos }),
      setSearch: (value: string) => set({ search: value }),
      setLanguage: (value: string) => set({ language: value }),
      toggleAutoAudit: (repoName: string) =>
        set((state) => ({
          repos: state.repos.map((repo) =>
            repo.name === repoName
              ? { ...repo, auto_audit: !repo.auto_audit }
              : repo
          ),
        })),
    }),
    { name: 'repo-store' }
  )
);
