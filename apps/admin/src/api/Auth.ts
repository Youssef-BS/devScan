import axios from "axios";
import Cookies from "js-cookie";

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


export const fetchCurrentAdmin = async () => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/admin/current`,
      { withCredentials: true }
    );

    return response.data.admin || null;

  } catch (error: any) {
    console.error(
      "Failed to fetch current admin:",
      error.response?.data?.message || error.message
    );
    return null;
  }
};

export const logoutAdmin = async () => {
    try {
        await axios.post(`${API_BASE_URL}/admin/logout`, {}, { withCredentials: true });    
    }catch(error : any) {
        console.error("Logout failed:", error.response?.data?.message || error.message);
    }
}



