export interface Commit {
  id: number;
  sha: string;
  message: string;
  author: string;
  date: string;
  repoId: number;
}

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

export interface CommitFile {
  sha: string;
  path: string;
  status: string;
  additions: number;
  deletions: number;
   changes?: number;        
  patch?: string;
}

export interface CommitFileCardProps {
  file: CommitFile;
  index: number;
}