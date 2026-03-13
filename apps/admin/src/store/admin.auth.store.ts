import {create} from "zustand" ;
import { AdminLogin , fetchCurrentAdmin , logoutAdmin } from "../services/auth.service";
import type { AdminState } from "@/types/Admin";


export const useAdminStore = create<AdminState>((set) => ({
  admin: null,
  loading: false,
  error: null,
  initialized: false,
  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      await AdminLogin(email, password);
      const response = await fetchCurrentAdmin();
      set({ admin: response, loading: false , initialized: true });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || "Login failed", 
        loading: false 
      });
      throw error; 
    }
  },

  logout: async () => {
    try {
      await logoutAdmin();
      set({ admin: null , initialized: true });
    } catch (error) {
      console.error("Logout error:", error);
    }
  },

  fetchCurrentAdmin: async () => {
    set({ loading: true });
    try {
      const admin = await fetchCurrentAdmin();
      set({ admin, loading: false , initialized: true });
    } catch (error) {
      set({ admin: null, loading: false , initialized: true });
    }
  },
}));

