import axios from "axios";
import { Request, Response } from "express";
import {prisma} from "../db";


export const fetchAndSaveLastCommit = async (req: Request, res: Response) => {

  const { githubId } = req.params;
  
  try {
    const repo = await prisma.repo.findUnique({
      where: { githubId: String(githubId) },
    });

    if (!repo) return res.status(404).json({ message: "Repo not found" });

    console.log("Calling GitHub API for:", repo.fullName);

    const commitsRes = await axios.get(
      `https://api.github.com/repos/${repo.fullName}/commits`,
      {
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_ACCESS_TOKEN}`,
          Accept: "application/vnd.github+json",
        },
        params: { per_page: 1 },
      }
    );

    const lastCommit = commitsRes.data[0];
    if (!lastCommit)
      return res.status(404).json({ message: "No commits found" });

    const commitSha = lastCommit.sha;
    const commitMessage = lastCommit.commit.message;
    const commitAuthor = lastCommit.commit.author.name;
    const commitDate = new Date(lastCommit.commit.author.date);

    await prisma.repo.update({
      where: { githubId: String(githubId) },
      data: {
        lastCommitSha: commitSha,
        lastCommitMessage: commitMessage,
        lastCommitDate: commitDate,
      },
    });

    await prisma.commit.upsert({
      where: { sha: commitSha },
      update: {}, 
      create: {
        sha: commitSha,
        message: commitMessage,
        author: commitAuthor,
        date: commitDate,
        repoId: repo.id,
      },
    });

    res.status(200).json({
      message: "Last commit saved",
      commit: { sha: commitSha, message: commitMessage, author: commitAuthor },
    });
  } catch (error) {
    console.error("Error in fetchAndSaveLastCommit:", error);
    res.status(500).json({ message: (error as Error).message });
  }
};


export const getLastCommit = async (req: Request, res: Response) => {
  const { githubId } = req.params;

  try {
    const repo = await prisma.repo.findUnique({
      where: { githubId: String(githubId) },
      include: { commits: { orderBy: { date: "desc" }, take: 1 } },
    });

    if (!repo) return res.status(404).json({ message: "Repo not found" });

    const lastCommit = repo.commits[0];
    if (!lastCommit)
      return res.status(404).json({ message: "No commits found" });

    res.status(200).json(lastCommit);
  } catch (error) {
    console.error("Error in getLastCommit:", error);
    res.status(500).json({ message: (error as Error).message });
  }
};
