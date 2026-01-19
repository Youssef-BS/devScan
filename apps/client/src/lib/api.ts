export const logout = () => {
    const res = fetch('http://localhost:4000/auth/logout', {
        method: 'POST',
        credentials: 'include',
    });

    const data = res.then((res)=> res.json());
    console.log(data);
    window.location.href = '/';
}

