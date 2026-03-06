export interface AdminState {
    admin : {email : string , role : "ADMIN" } | null ;
    loading : boolean ;
    initialized: boolean;
    error : string | null ;
    login  : (email : string , password : string) => Promise<void> ; 
    logout : () => void ;
    fetchCurrentAdmin : () => Promise<void> ;
}

export interface AdminLoginResponse {
  message: string;
  admin?: { email: string; role: "ADMIN" };
}