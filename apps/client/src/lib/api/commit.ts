const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const fetchCommitsFromGitHub = async (githubId: string) => {
  try {
    const res = await fetch(`${API_BASE_URL}/github/commit/fetch/${githubId}`);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error("Failed to fetch commits from GitHub:", res.status, errorText);
      throw new Error(`HTTP ${res.status}: ${errorText || 'Failed to fetch commits'}`);
    }
    
    const data = await res.json();
    console.log("Fetched commits from GitHub:", data);
    return data;
  } catch (err: any) {
    console.error("Error fetching commits from GitHub:", err);
    throw err;
  }
};

export const getAllCommits = async (githubId: string) => {
  try {
    const res = await fetch(`${API_BASE_URL}/github/commit/${githubId}`);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error("Failed to get commits from DB:", res.status, errorText);
      throw new Error(`HTTP ${res.status}: ${errorText || 'Failed to get commits'}`);
    }
    
    const data = await res.json();
    console.log("Got commits from DB:", data.length);
    return data;
  } catch (err: any) {
    console.error("Error getting commits from DB:", err);
    throw err;
  }
};