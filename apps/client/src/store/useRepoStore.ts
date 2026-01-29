import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Repo } from '@/types/Repo';

import {
  deleteAllGithubRepos,
  getGithubReposApi,
  updateAutoAuditApi,
  saveGithubRepo,
  getAllFromDb,
  getRepoDetails
} from '@/lib/api/github';

interface RepoStore {
  repos: Repo[];
  dataFromDb: Repo[];
  repoDetails : Repo | null ;
  search: string;
  language: string;
  loading: boolean;
  page: number;
  totalPages: number;

  fetchRepos: (page?: number) => Promise<void>;
  getFromDb: (page?: number) => Promise<void>;

  setRepos: (repos: Repo[]) => void;
  setSearch: (value: string) => void;
  setLanguage: (value: string) => void;

  saveRepo: (repo: Repo) => Promise<void>;
  deleteAllRepos: () => Promise<void>;
  toggleAutoAudit: (repoName: string) => Promise<void>;

  getRepoDetails : (githubId : string) => Promise<void>;

}

export const useRepoStore = create<RepoStore>()(
  persist(
    (set, get) => ({
      repos: [],
      dataFromDb: [],
      repoDetails : null ,
      search: '',
      language: 'all',
      loading: false,
      page: 1,
      totalPages: 1,

      setRepos: (repos) => set({ repos }),
      setSearch: (value) => set({ search: value }),
      setLanguage: (value) => set({ language: value }),

      fetchRepos: async (page = 1) => {
        set({ loading: true });
        try {
          const { search, language } = get();
          const res = await getGithubReposApi(page, 9, search, language);

          set({
            repos: res.data.map((repo: any) => ({
              id: repo.id,
              name: repo.name,
              description: repo.description ?? '',
              full_name: repo.full_name,
              language: repo.language ?? 'Unknown',
              auto_audit: repo.auto_audit ?? false,
              githubId: repo.githubId,
              html_url: repo.html_url,
              private: repo.private,
              fork: repo.fork,
              state: repo.private ? 'private' : 'public',
              issues: 0,
              lastScan: 'Never',
            })),
            page: res.pagination.page,
            totalPages: res.pagination.totalPages,
          });
        } catch (e) {
          set({ repos: [] });
        } finally {
          set({ loading: false });
        }
      },

      getRepoDetails : async (githubId) => {
        set({loading : true})
      
        try {

          const res = await getRepoDetails(githubId)
          set({repoDetails : res})

        }catch(error) {
        
          set({repoDetails : null})
        
        }finally{
          set({loading : false})
        }
      },

      getFromDb: async (page = 1) => {
        set({ loading: true });
        try {
          const res = await getAllFromDb(page, 9);

          set({
            dataFromDb: res.data.map((repo: any) => ({
              id: repo.id,
              name: repo.name,
              description: repo.description ?? '',
              full_name: repo.full_name,
              language: repo.language ?? 'Unknown',
              auto_audit: repo.auto_audit ?? false,
              githubId: repo.githubId,
              html_url: repo.html_url,
              private: repo.private,
              fork: repo.fork,
              issues: 0,
              lastScan: repo.lastScan ?? 'Never',
              state: repo.private ? 'private' : 'public',
            })),
            page: res.pagination.page,
            totalPages: res.pagination.totalPages,
          });
        } catch (e) {
          set({ dataFromDb: [] });
        } finally {
          set({ loading: false });
        }
      },

      saveRepo: async (repo: Repo) => {
        await saveGithubRepo(repo);
      },

      deleteAllRepos: async () => {
        await deleteAllGithubRepos();
        set({ repos: [] });
      },

      toggleAutoAudit: async (repoName: string) => {
        const { repos } = get();
        const repo = repos.find((r) => r.full_name === repoName);
        if (!repo) return;

        const newValue = !repo.auto_audit;

        set({
          repos: repos.map((r) =>
            r.full_name === repoName ? { ...r, auto_audit: newValue } : r
          ),
        });

        try {
          await updateAutoAuditApi(repoName, newValue);
        } catch {
          set({
            repos: repos.map((r) =>
              r.full_name === repoName
                ? { ...r, auto_audit: !newValue }
                : r
            ),
          });
        }
      },
    }),
    {
      name: 'repo-store',
      partialize: (state) => ({
        search: state.search,
        language: state.language,
      }),
    }
  )
);
