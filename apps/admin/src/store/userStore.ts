import { create } from "zustand";
import { fetchAllUsers, fetchUserById } from "@/services/user.service";
import type { UserState } from "@/types/User";

export const useUserStore = create<UserState>((set) => ({
  users: [],
  pagination: null,
  user: null,
  loading: false,
  error: null,
  initialized: false,

  fetchListUsers: async (page = 1) => {
    set({ loading: true, error: null });

    try {
      const res = await fetchAllUsers(page, 10);

      set({
        users: res.data,
        pagination: res.pagination,
        loading: false,
        initialized: true,
      });

    } catch (error: any) {
      const msg = error.message || "Failed to fetch users";
      set({ error: msg, loading: false });
    }
  },


fetchUserDetails: async (id: number) => {
  set({ loading: true, error: null });

  try {
    const user = await fetchUserById(id);
    set({
      user ,
      loading: false,
    });

  } catch (error: any) {
    const msg = error.message || "Failed to fetch user details";
    set({ error: msg, loading: false });
  }
}
}));