import {create} from "zustand" ;
import { getCurrentUserApi , logout , CompleteProfileApi, ChangePasswordApi , UpdateNameApi } from "@/services/auth.service";

interface AuthStore {
    user : any | null ;
    loading : boolean ;
    error : string | null ;
    isAuthenticated : boolean ;
    getCurrentUser : () => Promise<void> ;
    logout : () => void ;
    completeProfile : (data: { firstName: string; lastName: string; password: string }) => Promise<void>;
    changePassword : (data : {currentPassword : string , newPassword : string}) => Promise<void> ;
    updateName : (data : {firstName : string , lastName : string}) => Promise<void> ;
}

export const useAuthStore = create<AuthStore>((set)=>({
    user : null ,
    loading : false ,
    error : null ,
    isAuthenticated : false ,

    getCurrentUser : async () => {
        set({ loading: true, error: null });
        try {
            await getCurrentUserApi({
                setUser: (user: any) => set({ user, isAuthenticated: !!user }),
                setLoading: (loading: boolean) => set({ loading }),
            });
        } catch (error: any) {
            console.error("Error fetching current user:", error);
            set({ user: null, isAuthenticated: false, error: error.message || "Failed to fetch user" });
        }
    } ,

    logout : async () => {
        try {
            await logout();
            set({ user: null, isAuthenticated: false });
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
                setUser: (user: any) => set({ user, isAuthenticated: !!user }),
                setLoading: (loading: boolean) => set({ loading }),
            });
        } catch (error: any) {
            console.error("Complete profile error:", error);
            set({ error: error.message || "Profile update failed" });
        } finally {
            set({ loading: false });
        }
    } ,

    changePassword : async (data) => {
        set({loading : true , error : null}) ;
        try {
            await ChangePasswordApi(data);
            await getCurrentUserApi({
                setUser : (user : any) => set({user, isAuthenticated: !!user}) ,
                setLoading : (loading : boolean) => set({loading}),
            });

        }catch(error : any) {
            console.error("Complete profile error:", error);
            set({loading : false , error: error.message || "Profile update failed" });
        }
    } , 
    updateName: async (data) => {
  try {
    set({ loading: true, error: null });

    const updatedUser = await UpdateNameApi(data);

    set({
      user: updatedUser,
      isAuthenticated: !!updatedUser,
      loading: false,
    });

  } catch (error: any) {
    console.error("Update name error:", error);

    set({
      loading: false,
      error: error.message || "Failed to update name",
    });
  }
}
}))
