import {create} from "zustand";
import { fetchAllUsers } from "@/services/user.service";
import type { UserState } from "@/types/User";


export const useUserStore = create<UserState>((set) => ({
users : [] ,
user : null ,
loading : false ,
error : null ,
initialized: false ,
fetchCurrentUser : async () => {
    set({ loading: true, error: null });
     try {
        const users = await fetchAllUsers();
        set({ users, loading: false , initialized: true });
        console.log("Fetched users successfully", { count: users.length  , users});
     }catch(error : any) {
        const msg = error.response?.data?.message || "Failed to fetch users";
        set({ error: msg, loading: false });
     }
}

})) ;