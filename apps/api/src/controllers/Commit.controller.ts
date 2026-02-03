import axios from "axios";
import { Request, Response } from "express";
import { prisma } from "../db";

export const fetchAndSaveAllCommits = async (req: Request, res: Response) => {
  const { githubId } = req.params;

  try {
    const repo = await prisma.repo.findUnique({
      where: { githubId: String(githubId) },
    });

    if (!repo) {
      console.error("Repo not found in DB for githubId:", githubId);
      return res.status(404).json({ message: "Repo not found" });
    }

    if (!repo.fullName) {
      console.error("Repo fullName missing for githubId:", githubId);
      return res.status(500).json({ message: "Repo fullName is missing" });
    }

    console.log("Fetching commits for:", repo.fullName);

    const commitsRes = await axios.get(
      `https://api.github.com/repos/${repo.fullName}/commits`,
      {
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_ACCESS_TOKEN}`,
          Accept: "application/vnd.github+json",
        },
        params: { per_page: 100 },
      }
    );

    const commits = commitsRes.data;
    console.log("GitHub returned commits:", commits.length);

    if (!commits || commits.length === 0) {
      return res.status(404).json({ message: "No commits found" });
    }

    for (const c of commits) {
      await prisma.commit.upsert({
        where: { sha: c.sha },
        update: {},
        create: {
          sha: c.sha,
          message: c.commit.message,
          author: c.commit.author?.name || "Unknown",
          date: new Date(c.commit.author?.date),
          repoId: repo.id,
        },
      });
    }

    res.status(200).json({
      message: "All commits fetched and saved",
      total: commits.length,
    });
  } catch (error: any) {
    console.error("Error in fetchAndSaveAllCommits:", error.response?.data || error.message);
    res.status(500).json({ message: error.message });
  }
};


export const getAllCommits = async (req: Request, res: Response) => {
  const { githubId } = req.params;

  try {
    const repo = await prisma.repo.findUnique({
      where: { githubId: String(githubId) },
    });

    if (!repo) {
      return res.status(404).json({ message: "Repo not found" });
    }

    const commits = await prisma.commit.findMany({
      where: { repoId: repo.id },
      orderBy: { date: "desc" },
    });

    if (!commits || commits.length === 0) {
      return res.status(404).json({ message: "No commits found" });
    }

    res.status(200).json(commits);
  } catch (error) {
    console.error("Error in getAllCommits:", error);
    res.status(500).json({ message: (error as Error).message });
  }
};

export const commitDetails = async (req: Request, res: Response) => {
  const shaParam = req.params.sha;
  if (typeof shaParam !== "string") {
    return res.status(400).json({ message: "Invalid commit SHA" });
  }
  const sha = shaParam;

  try {
    if (!req.session.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // Find the commit and get access token
    const commit = await prisma.commit.findUnique({
      where: { sha },
      include: {
        Repo: {
          include: {
            User: {
              select: { accessToken: true },
            },
          },
        },
      },
    });

    if (!commit) {
      return res.status(404).json({ message: "Commit not found" });
    }

    const accessToken = commit.Repo.User?.accessToken;
    if (!accessToken) {
      return res.status(400).json({ message: "GitHub access token missing" });
    }

    // Fetch files from GitHub commit
    const commitRes = await axios.get(
      `https://api.github.com/repos/${commit.Repo.fullName}/commits/${sha}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github+json",
        },
      }
    );

    console.log(JSON.stringify(commitRes.data, null, 2));

    const files = commitRes.data.files;
    if (!files || files.length === 0) {
      return res.status(404).json({ message: "No files found in this commit" });
    }

    const savedFiles = [];

for (const file of files) {
  const path = file.filename;
  if (!path) {
    console.warn("Skipping file with missing filename", file);
    continue;
  }

  const contentRaw = file.raw_url
    ? (await axios.get(file.raw_url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })).data
    : "";

  let content: any;
  try {
    content = JSON.parse(contentRaw);
  } catch {
    content = contentRaw; // fallback to text
  }

  // Only upsert if commit.id exists
  if (!commit.id) {
    console.warn("Skipping upsert because commit.id is missing");
    continue;
  }

  try {
    const commitFile = await prisma.commitFile.upsert({
      where: { sha_path: { sha, path } },
      update: { content },
      create: {
        sha,
        path,
        content,
        commitId: commit.id,
      },
    });

    savedFiles.push({ path: commitFile.path, content: commitFile.content });
  } catch (err) {
    console.error(`Failed to upsert file ${path}`, err);
  }
}


    return res.status(200).json({
      message: "Commit details fetched successfully",
      files: savedFiles,
    });
  } catch (error: any) {
    console.error("commitDetails error:", error.response?.data || error.message);
    return res.status(500).json({ message: error.message });
  }
};