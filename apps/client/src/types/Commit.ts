export interface Commit {
  id: number;
  sha: string;
  message: string;
  author: string;
  date: string;
  repoId: number;
}