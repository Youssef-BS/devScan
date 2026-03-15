import {create} from "zustand" ;
import { getCurrentUserApi , logout , CompleteProfileApi } from "@/services/auth.service";

interface AuthStore {
    user : any | null ;
    loading : boolean ;
    error : string | null ;
    getCurrentUser : () => Promise<void> ;
    logout : () => void ;
    completeProfile : (data: { firstName: string; lastName: string; password: string }) => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set)=>({
    user : null ,
    loading : false ,
    error : null ,

    getCurrentUser : async () => {
        set({ loading: true, error: null });
        try {
            await getCurrentUserApi({
                setUser: (user: any) => set({ user }),
                setLoading: (loading: boolean) => set({ loading }),
            });
        } catch (error: any) {
            console.error("Error fetching current user:", error);
            set({ user: null, error: error.message || "Failed to fetch user" });
        }
    } ,

    logout : async () => {
        try {
            await logout();
            set({ user: null });
        } catch (error: any) {
            console.error("Logout error:", error);
            set({ error: error.message || "Logout failed" });
        }
    },

    completeProfile : async (data) => {
        set({ loading: true, error: null });
        try {
            await CompleteProfileApi(data);
            await getCurrentUserApi({
                setUser: (user: any) => set({ user }),
                setLoading: (loading: boolean) => set({ loading }),
            });
        } catch (error: any) {
            console.error("Complete profile error:", error);
            set({ error: error.message || "Profile update failed" });
        } finally {
            set({ loading: false });
        }
    }
}))
