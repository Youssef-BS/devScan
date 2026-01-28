import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Repo } from '@/types/Repo';
import { deleteAllGithubRepos, getGithubReposApi , updateAutoAuditApi , saveGithubRepo } from '@/lib/api/github';

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
  toggleAutoAudit: (repoName: string) => Promise<void>;
  deleteAllRepos : () => Promise<void> ;
  saveRepo  : (value : Repo) => Promise<void> ;

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

saveRepo: async (value: Repo) => {
  try {
    const result = await saveGithubRepo(value);
    console.log("Repo saved successfully:", result);
    return result;
  } catch (error) {
    console.error(error);
    throw error;
  }
},


      fetchRepos: async (page = 1) => {
        set({ loading: true });

        try {
          const res = await getGithubReposApi(page, 9);

          set({
            repos: res?.data.map((repo: any) => ({
              id: repo.id,
              name: repo.name,
              description: repo.description ?? '',
              full_name : repo.full_name,
              language: repo.language ?? 'Unknown',
              auto_audit: repo.auto_audit ?? false,
              githubId : repo.githubId,
              html_url: repo.html_url,
              private: repo.private,
              fork: repo.fork,
              issues: 0,
              lastScan: 'Never',
              state: repo.private ? 'private' : 'public',
            })),
            page: res?.pagination.page,
            totalPages: res?.pagination.totalPages,
          });
        } catch (error) {
          console.error('Failed to fetch repos:', error);
          set({ repos: [] });
        } finally {
          set({ loading: false });
        }
      },

      setRepos: (repos) => set({ repos }),
      setSearch: (value) => set({ search: value }),
      setLanguage: (value) => set({ language: value }),
      deleteAllRepos : async () => {
          try {
            await deleteAllGithubRepos()
            set({repos : []})
          }catch(error) {
            console.error("Error deleting All repos" , error)
          }
      } ,

      toggleAutoAudit: async (repoName) => {
        const currentState = useRepoStore.getState();
        const repo = currentState.repos.find((r) => r.full_name === repoName);
        const newAuditStatus = repo ? !repo.auto_audit : false;
        set((state) => ({
          repos: state.repos.map((r) =>
            r.full_name === repoName
              ? { ...r, auto_audit: newAuditStatus }
              : r
          ),
        }));
        try {
          await updateAutoAuditApi(repoName, newAuditStatus);
        } catch (error) {
          console.error('Error updating auto_audit:', error);
          set((state) => ({
            repos: state.repos.map((r) =>
              r.full_name === repoName
                ? { ...r, auto_audit: !newAuditStatus }
                : r
            ),
          }));
        }
      },
    }),
    { name: 'repo-store' }
  )
);
