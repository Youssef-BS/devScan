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
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface RepoListResponse {
  data: Repo[];
  pagination: Pagination;
}

export interface CreateRepoPayload {
  githubId: string;
  name: string;
  fullName: string;
  htmlUrl: string;
  description?: string;
  language?: string;
  private: boolean;
  fork: boolean;
  ownerId: number;
}