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

    },
     
    logout : async () => {
        set({admin : null}) ;
    } ,

    fetchCurrentAdmin : async () => {
         set({loading : true }) ;
    }
})

)