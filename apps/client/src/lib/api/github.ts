import { Repo } from "@/types/Repo";

export const getGithubReposApi = async (
  page = 1,
  limit = 9,
  search = '',
  language = 'all'
) => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    search,
    language,
  });

  const res = await fetch(
    `http://localhost:4000/github/repos?${params.toString()}`,
    { credentials: 'include' }
  );

  if (!res.ok) throw new Error('Failed to fetch repos');

  return res.json();
};


export const saveReposInDB = async () => {
  const res = await fetch('http://localhost:4000/github/repos/sync', {
    method: 'POST',
    credentials: 'include',
  });

  if (!res.ok) {
    return ;
  }

  return res.json();
};

export const updateAutoAuditApi = async (full_name: string, auto_audit: boolean) => {
  const res = await fetch(`http://localhost:4000/github/repos/${full_name}/audit`, {
    method: 'PATCH',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ auto_audit }),
  });

  if (!res.ok) {
    return ;
  }

  return res.json();
};


export const deleteAllGithubRepos = async () => {
 const res = await fetch('http://localhost:4000/github/repos/clear' , {
  method : "DELETE" , 
  credentials : "include" , 
  headers : {
    'Content-Type' : 'application/json' ,
  }
 })

 if(!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to delete repos");
 }

 return res.json() ;

}


export const saveGithubRepo = async (repo: Repo) => {
  const payload = {
    githubId: repo.githubId,
    name: repo.name,
    fullName: repo.full_name,
    htmlUrl: repo.html_url,
    description: repo.description,
    language: repo.language,
    private: repo.private,
    fork: repo.fork,
  };

  const res = await fetch("http://localhost:4000/github/repos/save", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json();
    console.error('Backend error response:', error);
    throw new Error(error.details || error.message || "Failed to save repository");
  }

  const data = await res.json();
  console.log(data);
  return data;
};

export const getAllFromDb = async (page = 1, limit = 9) => {
  const res = await fetch(
    `http://localhost:4000/github/repos/all-db?page=${page}&limit=${limit}`,
    {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch repos from DB");
  }

  return res.json();
};


export const getRepoDetails = async (id : string) => {

  const res = await fetch(`http://localhost:4000/github/repos/${id}` , {
    method : "GET" , 
    credentials : "include" , 
    headers : {"Content-Type": "application/json"}
  })

  if(!res.ok) {
    return ;
  }

  return res.json();

}



