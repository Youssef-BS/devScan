export const getLastCommit = async (githubId: string) => {
  try {
    const res = await fetch(`http://localhost:4000/github/commit/fetch/${githubId}`, {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      console.error("Failed to fetch last commit", res.statusText);
      return null;
    }

    return res.json();
  } catch (error) {
    console.error("Error fetching last commit:", error);
    return null;
  }
};
