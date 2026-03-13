import { api } from "@/lib/axios";
import type { RepoListResponse, CreateRepoPayload } from "@/types/Repo";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/github";

export const fetchAllRepos = async (
  page = 1,
  limit = 9
): Promise<RepoListResponse> => {
  const res = await api.get(
    `${API_BASE_URL}/repos/get-all-db?page=${page}&limit=${limit}`
  );
  return res.data;
};

export const createRepo = async (data: CreateRepoPayload) => {
  const res = await api.post(`${API_BASE_URL}/repos/save-single`, data);
  return res.data;
};

export const deleteRepo = async (githubId: string) => {
  const res = await api.delete(
    `${API_BASE_URL}/repos/delete/${githubId}`
  );
  return res.data;
};