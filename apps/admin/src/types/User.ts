export interface UserState {
    users : any[] | null ;
    user : any | null ;
    loading : boolean ;
    initialized: boolean;
    error : string | null ;
    fetchCurrentUser : () => Promise<void> ;
}

export interface UserResponse {
  message: string;
  user?: {
    id: number;
    githubId?:string;
    username?: string;
    email?: string;
    avatarUrl?: string;
    role: "USER" | "ADMIN";
    isBanned: boolean;
    createdAt: string;

    repos?: Repo[];
  };
}

export interface Repo {
  id: number;
  githubId: string;
  name: string;
  fullName: string;
  htmlUrl: string;
  description?: string;
  language?: string;
  private: boolean;
  fork: boolean;
  autoAudit: boolean;
  createdAt: string;

  commits?: Commit[];
}

export interface Commit {
  id: number;
  sha: string;
  message: string;
  author: string;
  date: string;

  files?: CommitFile[];
}

export interface CommitFile {
  id: number;
  sha: string;
  path: string;
  content: any;
  createdAt: string;
  updatedAt: string;
}