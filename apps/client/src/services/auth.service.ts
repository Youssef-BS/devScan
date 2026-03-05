const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const getCurrentUserApi = async ({setUser, setLoading} : {setUser : (user:any) => void , setLoading : (loading:boolean) => void}) => {
  try {
        const res = await fetch(`${apiUrl}/auth/current-user`, {
          credentials: "include",
        });
        if (!res.ok) {
          setUser(null)
          return ;
        }
        const data = await res.json();
        setUser(data.user);
  } catch (error) {
        setUser(null);
   } finally {
        setLoading(false);
      }
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