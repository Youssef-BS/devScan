import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

interface AdminLoginResponse {
    message : string ; 
    admin ?: {email : string , role : "ADMIN" } ;
}

export const AdminLogin = async (email : string , password : string) : Promise<AdminLoginResponse> => {
    try {
        
        const response = await axios.post<AdminLoginResponse>(
            `${API_BASE_URL}/admin/login`, 
            { email, password },
            { withCredentials: true }
        );

        return response.data;

    }catch(error :any){
         const msg = error.response?.data?.message || "Login failed";
         throw new Error(msg);    
    }

}