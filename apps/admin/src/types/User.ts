export interface UserState {
  users:  User[] | null;
  user: User | null;
  pagination: Pagination | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;

  fetchListUsers: (page?: number) => Promise<void>;
  fetchUserDetails: (id : number) => Promise<void>;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface User {
  id: number;
  username?: string;
  email?: string;
  avatarUrl?: string;
  role: "USER" | "ADMIN";
  isBanned: boolean;
  repos ?: Repo[];
}


export interface UserResponse {
  message: string;
  user?: User;
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

export interface UsersListResponse {
  data: User[];
  pagination: Pagination;
}

export interface UserDetailsResponse {
  user: User;
}