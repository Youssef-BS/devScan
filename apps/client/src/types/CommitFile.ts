export interface CommitFile {
  id: number;
  path: string;
  status: string;
  additions: number;
  deletions: number;
  changes: number;
  patch: string;
  sha: string;
}