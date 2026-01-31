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
