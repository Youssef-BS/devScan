import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Repo } from '@/types/Repo';
import { getGithubReposApi , syncGithubReposApi} from '@/lib/api';
import { get } from 'http';

interface RepoStore {
  repos: Repo[];
  search: string;
  language: string;
  loading: boolean;

  page: number;
  totalPages: number;

  fetchRepos: (page?: number) => Promise<void>;
  setRepos: (repos: Repo[]) => void;
  setSearch: (value: string) => void;
  setLanguage: (value: string) => void;
  toggleAutoAudit: (repoName: string) => void;
  asyncRepos : () => Promise<void> ; 
}

export const useRepoStore = create<RepoStore>()(
  persist(
    (set) => ({
      repos: [],
      search: '',
      language: 'all',
      loading: false,

      page: 1,
      totalPages: 1,
      

      fetchRepos: async (page = 1) => {
        set({ loading: true });

        try {
          const res = await getGithubReposApi(page, 9);

          set({
            repos: res.data.map((repo: any) => ({
              name: repo.name,
              description: repo.description ?? '',
              language: repo.language ?? 'Unknown',
              auto_audit: false,
              issues: 0,
              lastScan: 'Never',
              state: repo.private ? 'private' : 'public',
            })),
            page: res.pagination.page,
            totalPages: res.pagination.totalPages,
          });
        } catch (error) {
          console.error('Failed to fetch repos:', error);
          set({ repos: [] });
        } finally {
          set({ loading: false });
        }
      },

      asyncRepos : async () => {
        set({ loading: true });
        try {

          const res = await getGithubReposApi();
          set({
            repos: res.data.map((repo: any) => ({
              name: repo.name,
              description: repo.description ?? '',
              language: repo.language ?? 'Unknown',
              auto_audit: false,
              issues: 0,
              lastScan: 'Never',
              state: repo.private ? 'private' : 'public',
            })),
          });
        } catch (error) {
          console.error('Failed to fetch repos:', error);
        }
      } ,

      setRepos: (repos) => set({ repos }),
      setSearch: (value) => set({ search: value }),
      setLanguage: (value) => set({ language: value }),

      toggleAutoAudit: (repoName) =>
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
