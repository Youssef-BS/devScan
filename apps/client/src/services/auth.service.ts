import { User , UserResponse } from "@/types/user";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';


export const loginUserApi = async ({email, password}: User): Promise<UserResponse | null> => {
  try {
    const res = await fetch(`${apiUrl}/auth/login`, {
      method: "POST",
      credentials: "include",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({email, password})
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Failed to login");
    }

    return await res.json();
  } catch (error) {
    console.error(error);
    return null; 
  }
};

export const getCurrentUserApi = async ({ setUser, setLoading }: any) => {
  try {

    const res = await fetch(`${apiUrl}/auth/current-user`, {
      credentials: "include",
    });

    if (!res.ok) {
      setUser(null);
      return;
    }

    const data = await res.json();
    setUser(data);
  } catch (error) {
    console.error(error);
    setUser(null);
  } finally {
    setLoading(false);
  }
};

export const CompleteProfileApi = async ({ firstName, lastName, password } : any) => {
  const res = await fetch(`${apiUrl}/auth/update-profile`, {
    method: "POST",
    credentials: "include", 
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ firstName, lastName, password }),
  });

  if (!res.ok) {
    const err = await res.json();
    console.error("Backend error:", err);
    throw new Error(err.message || "Failed to update profile");
  }

  return res.json();
};

export const UpdateNameApi = async ({ firstName, lastName }: any) => {
  const res = await fetch(`${apiUrl}/auth/update-name`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ firstName, lastName }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to update name");
  }

  return res.json();
};

export const ChangePasswordApi = async ({ currentPassword, newPassword } : any) => {
  const res = await fetch(`${apiUrl}/auth/change-password`, {
    credentials : "include" ,
    method : "PATCH",
    headers : {"Content-Type" : "application/json"} ,
    body : JSON.stringify({currentPassword , newPassword })
  }) ;

  if(!res.ok) {
    const err = await res.json() ;
    throw new Error(err.message || "Failed to Change Password") ;
  }

  return res.json();


}

export const logout = () => {
    
    const res = fetch(`${apiUrl}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
    });

    const data = res.then((res)=> res.json());
    console.log(data);
    window.location.href = '/';
}