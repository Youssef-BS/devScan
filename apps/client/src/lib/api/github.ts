import { Repo } from "@/types/Repo";

export const getGithubReposApi = async (page = 1 , limit = 9) => {
  const res = await fetch('http://localhost:4000/github/repos', {
    credentials: 'include',
  });

  if (!res.ok) {
    return ;
  }

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

 return res.json()

}


export const saveGithubRepo = async (repo: Repo) => {
  const payload = {
    githubId: repo.id,
    name: repo.name,
    fullName: repo.full_name,
    htmlUrl: repo.html_url,
    description: repo.description,
    language: repo.language,
    privateRepo: repo.private,
    fork: repo.fork,
  };

  const res = await fetch("http://localhost:4000/github/repos/save", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    return ;
  }

  return res.json();
};

