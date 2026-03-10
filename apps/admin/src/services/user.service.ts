import { api } from "@/lib/axios";
import type { UserResponse } from "@/types/User";

export const fetchAllUsers = async () :Promise<UserResponse[]> => {
 try {
    const response = await api.get("/users");
    return response.data.users;
 }catch(error : any) {
    const msg = error.response?.data?.message || "Failed to fetch users";
    throw new Error(msg);
  }
 }
