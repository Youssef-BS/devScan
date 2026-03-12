import { create } from "zustand";
import { fetchAllUsers, fetchUserById , banUserById , unbanUserById } from "@/services/user.service";
import type { UserState } from "@/types/User";

export const useUserStore = create<UserState>((set , get) => ({
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
} ,
  banUser: async (id: number) => {
    try {
      await banUserById(id);
      const user = get().user;
      if (user && user.id === id) set({ user: { ...user, isBanned: true } });
    } catch (error: any) {
      console.error(error.message);
    }
  },

  unbanUser: async (id: number) => {
    try {
      await unbanUserById(id);
      const user = get().user;
      if (user && user.id === id) set({ user: { ...user, isBanned: false } });
    } catch (error: any) {
      console.error(error.message);
    }
  },
}));