import axios from "axios";
import { Request, Response } from "express";
import { prisma } from "../db";

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8003";

export const fetchAndSaveAllCommits = async (req: Request, res: Response) => {
  const { githubId } = req.params;

  if (!githubId || typeof githubId !== 'string') {
    return res.status(400).json({ message: "Repository ID is required" });
  }

  try {
    const repo = await prisma.repo.findUnique({
      where: { githubId },
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

  if (!githubId || typeof githubId !== 'string') {
    return res.status(400).json({ message: "Repository ID is required" });
  }

  try {
    const repo = await prisma.repo.findUnique({
      where: { githubId },
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

export const getCommitDetails = async (req: Request, res: Response) => {
  let sha: string;
  
  if (typeof req.params.sha === 'string') {
    sha = req.params.sha;
  } else if (Array.isArray(req.params.sha) && req.params.sha.length > 0) {
    sha = req.params.sha[0] as string;
  } else {
    return res.status(400).json({ message: "Commit SHA is required" });
  }

  try {
    console.log("Fetching commit details for SHA:", sha);
    const existingFiles = await prisma.commitFile.findMany({
      where: { sha },
      orderBy: { path: 'asc' }
    });

    if (existingFiles.length > 0) {
      console.log(`Found ${existingFiles.length} files in database for SHA: ${sha}`);
      const formattedFiles = existingFiles.map(file => {
        let content = file.content;
        let patch = '';
        let status = 'modified';
        if (typeof content === 'object' && content !== null) {
          patch = (content as any).patch || '';
          status = (content as any).status || 'modified';
        } else if (typeof content === 'string') {
          patch = content;
        }
        
        return {
          path: file.path,
          status: status,
          additions: (content as any)?.additions || 0,
          deletions: (content as any)?.deletions || 0,
          changes: (content as any)?.changes || 0,
          patch: patch,
          sha: file.sha,
          id: file.id
        };
      });
      
      const commit = await prisma.commit.findUnique({
        where: { sha },
      });
      
      return res.status(200).json({
        message: "Commit changes retrieved from database",
        files: formattedFiles,
        commitInfo: {
          sha: sha,
          message: commit?.message || '',
          author: commit?.author || '',
          date: commit?.date || new Date(),
          totalChanges: formattedFiles.reduce((sum, file) => sum + (file.changes || 0), 0)
        }
      });
    }

    console.log("No files in database, fetching from GitHub...");
    const commit = await prisma.commit.findUnique({
      where: { sha },
      include: {
        Repo: {
          include: {
            User: { select: { accessToken: true } },
          },
        },
      },
    });

    if (!commit) {
      return res.status(404).json({ message: "Commit not found in database" });
    }
    const accessToken = commit.Repo.User?.accessToken || process.env.GITHUB_ACCESS_TOKEN;
    
    if (!accessToken) {
      console.error("No GitHub access token available");
      return res.status(400).json({ 
        message: "GitHub access token missing. Please reconnect your GitHub account." 
      });
    }

    console.log(`Fetching from GitHub: ${commit.Repo.fullName}/commits/${sha}`);
    const commitRes = await axios.get(
      `https://api.github.com/repos/${commit.Repo.fullName}/commits/${sha}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github+json",
        },
        timeout: 15000 
      }
    );

    const githubFiles = commitRes.data.files;
    if (!githubFiles || githubFiles.length === 0) {
      return res.status(404).json({ message: "No file changes found in this commit" });
    }

    console.log(`Processing ${githubFiles.length} file changes from GitHub...`);
    const savedFiles = [];
    
    // Sort files by path for consistency
    const sortedFiles = githubFiles.sort((a: any, b: any) => (a.filename || '').localeCompare(b.filename || ''));
    
    for (const file of sortedFiles) {
      const path = file.filename;
      if (!path) {
        console.warn("Skipping file with missing filename");
        continue;
      }
      const normalizedPath = path.replace(/\\/g, '/');
      console.log(`Processing: ${normalizedPath}`);
      
      // Get raw content from GitHub if patch is empty (binary files, etc)
      let patch = file.patch || '';
      let fileContent = '';
      
      if (!patch && file.raw_url) {
        try {
          console.log(`Fetching raw content for: ${normalizedPath}`);
          const rawRes = await axios.get(file.raw_url, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            timeout: 10000,
          });
          fileContent = rawRes.data;
          // For binary/non-text files, show first 1000 chars as preview
          if (fileContent && typeof fileContent === 'string' && fileContent.length > 0) {
            patch = `// File: ${normalizedPath}\n// Status: ${file.status}\n\n${fileContent.substring(0, 1000)}${fileContent.length > 1000 ? '\n// ... (content truncated)' : ''}`;
          }
        } catch (err: any) {
          console.warn(`Could not fetch raw content for ${normalizedPath}:`, err.message);
          patch = `// Binary or inaccessible file: ${normalizedPath}`;
        }
      }
      
      // Ensure patch always has value, even if empty
      if (!patch) {
        if (file.status === 'added') {
          patch = `// NEW FILE: ${normalizedPath}`;
        } else if (file.status === 'removed') {
          patch = `// DELETED FILE: ${normalizedPath}`;
        } else if (file.status === 'renamed') {
          patch = `// RENAMED FILE: ${normalizedPath}`;
        } else {
          patch = `// Modified file with no text diff - possibly binary: ${normalizedPath}`;
        }
      }
      
      const fileData = {
        path: normalizedPath,
        status: file.status || 'modified',
        additions: file.additions || 0,
        deletions: file.deletions || 0,
        changes: file.changes || 0,
        patch: patch, 
        raw_url: file.raw_url || '',
        filename: file.filename
      };
      try {
        const commitFile = await prisma.commitFile.create({
          data: {
            sha,
            path: normalizedPath,
            content: fileData,
            commitId: commit.id,
          },
        });
        
        savedFiles.push({
          path: normalizedPath,
          status: fileData.status,
          additions: fileData.additions,
          deletions: fileData.deletions,
          changes: fileData.changes,
          patch: fileData.patch,
          sha: sha,
          id: commitFile.id
        });
        
        console.log(`Saved file: ${normalizedPath}`);
      } catch (err: any) {
        console.error(`Failed to save file ${normalizedPath}:`, err.message);
        try {
          const updatedFile = await prisma.commitFile.update({
            where: { sha_path: { sha, path: normalizedPath } },
            data: { content: fileData },
          });
          
          savedFiles.push({
            path: normalizedPath,
            status: fileData.status,
            additions: fileData.additions,
            deletions: fileData.deletions,
            changes: fileData.changes,
            patch: fileData.patch,
            sha: sha,
            id: updatedFile.id
          });
          
          console.log(`Updated file: ${normalizedPath}`);
        } catch (updateErr: any) {
          console.error(`Failed to update file ${normalizedPath}:`, updateErr.message);
          savedFiles.push({
            path: normalizedPath,
            status: file.status || 'unknown',
            additions: file.additions || 0,
            deletions: file.deletions || 0,
            changes: file.changes || 0,
            patch: file.patch || 'No diff available',
            sha: sha,
            id: 0
          });
        }
      }
    }

    if (savedFiles.length === 0) {
      return res.status(200).json({
        message: "No files could be saved from this commit",
        files: [],
        commitInfo: {
          sha: sha,
          message: commitRes.data.commit?.message || '',
          author: commitRes.data.commit?.author?.name || '',
          date: commitRes.data.commit?.author?.date || new Date(),
          totalChanges: 0
        }
      });
    }

    return res.status(200).json({
      message: "Commit details fetched successfully",
      files: savedFiles,
      commitInfo: {
        sha: commitRes.data.sha,
        message: commitRes.data.commit?.message || '',
        author: commitRes.data.commit?.author?.name || '',
        date: commitRes.data.commit?.author?.date || new Date(),
        totalChanges: savedFiles.reduce((sum, file) => sum + (file.changes || 0), 0)
      }
    });
  } catch (error: any) {
    console.error("getCommitDetails error:", error.response?.data || error.message);
    return res.status(500).json({ 
      message: "Failed to fetch commit details",
      error: error.message,
      sha: sha,
      timestamp: new Date().toISOString()
    });
  }
};

export const analyzeCommitWithAI = async (req: Request, res: Response) => {
  const { code, sha, analysisType = "chatbot" } = req.body;

  if (!code) {
    return res.status(400).json({ message: "Code is required for analysis" });
  }

  try {
    console.log("Sending code to AI service for analysis...", { analysisType });
    
    const aiResponse = await axios.post(`${AI_SERVICE_URL}/analyze`, {
      code: code,
      analysis_type: analysisType
    }, {
      timeout: 30000
    });

    const analysis = aiResponse.data.analysis;

    res.status(200).json({
      message: "Code analysis completed",
      analysis: analysis,
      analysisType: analysisType,
      sha: sha || null,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error("AI analysis error:", error.message);
    res.status(500).json({ 
      message: "Failed to analyze code with AI",
      error: error.message,
      serviceUrl: AI_SERVICE_URL,
      timestamp: new Date().toISOString()
    });
  }
};
