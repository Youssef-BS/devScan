import {create} from "zustand" ;
import { AdminLogin } from "../api/Auth";

interface AdminState {
    admin : {email : string , role : "ADMIN" } | null ;
    loading : boolean ;
    error : string | null ;
    login  : (email : string , password : string) => Promise<void> ; 
    logout : () => void ;
    fetchCurrentAdmin : () => Promise<void> ;
}


export const useAdminStore = create<AdminState>((set)=> ({
    admin : null , 
    loading : false ,
    error : null ,
    login : async (email , password) => {
        set({loading : true , error : null}) ;
        try {
            await AdminLogin(email , password) ;
            set({admin : {email , role : "ADMIN"}, loading : false}) ;
        }catch(error : any) {
            set({error : error.response?.data?.message || "Login failed"}) ;
        }

    },
     
    logout : async () => {
        set({admin : null}) ;
    } ,

    fetchCurrentAdmin : async () => {
         set({loading : true }) ;
    }
})

)