import { api } from "@/lib/axios";
import type { UsersListResponse, UserDetailsResponse } from "@/types/User";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

export const fetchAllUsers = async (page = 1, limit = 10) : Promise<UsersListResponse> => {
  try {
    const response = await api.get(
      `${API_BASE_URL}/users?page=${page}&limit=${limit}`
    );

    return response.data;
  } catch (error: any) {
    const msg = error.response?.data?.message || "Failed to fetch users";
    throw new Error(msg);
  }
};

export const fetchUserById = async (id : number) : Promise<UserDetailsResponse> => {
  try {
    const response = await api.get(`${API_BASE_URL}/users/${id}`);
    return response.data;
  }catch (error: any) {
    const msg = error.response?.data?.message || "Failed to fetch user details";
    throw new Error(msg);
  }
}