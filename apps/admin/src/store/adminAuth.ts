import {create} from "zustand" ;
import { AdminLogin , fetchCurrentAdmin , logoutAdmin } from "../api/Auth";

export interface AdminState {
    admin : {email : string , role : "ADMIN" } | null ;
    loading : boolean ;
    error : string | null ;
    login  : (email : string , password : string) => Promise<void> ; 
    logout : () => void ;
    fetchCurrentAdmin : () => Promise<void> ;
}


export const useAdminStore = create<AdminState>((set) => ({
  admin: null,
  loading: false,
  error: null,
  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      await AdminLogin(email, password);
      const response = await fetchCurrentAdmin();
      set({ admin: response, loading: false });
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
      set({ admin: null });
    } catch (error) {
      console.error("Logout error:", error);
    }
  },

  fetchCurrentAdmin: async () => {
    set({ loading: true });
    try {
      const admin = await fetchCurrentAdmin();
      set({ admin, loading: false });
    } catch (error) {
      set({ admin: null, loading: false });
    }
  },
}));

