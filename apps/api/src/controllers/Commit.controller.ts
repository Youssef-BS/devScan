import axios from "axios";
import { Request, Response } from "express";
import { prisma } from "../db.js";

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
      return res.status(404).json({ message: "Repo not found" });
    }

    if (!repo.fullName) {
      return res.status(500).json({ message: "Repo fullName is missing" });
    }
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
      return res.status(400).json({ 
        message: "GitHub access token missing. Please reconnect your GitHub account." 
      });
    }
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

    const existingFiles = await prisma.commitFile.findMany({
      where: { sha },
      orderBy: { path: 'asc' }
    });
    const existingFilesMap = new Map(existingFiles.map(f => [f.path, f]));
    
    const allFiles = [] as any;
    const filesToSave = [];

    // Process all files from GitHub
    for (const file of githubFiles) {
      const normalizedPath = (file.filename || '').replace(/\\/g, '/');
      
      if (!normalizedPath) {
        console.warn(" Skipping file with missing filename");
        continue;
      }
      let patch = file.patch || '';
      
      // Try to fetch raw content if patch is empty
      if (!patch && file.raw_url) {
        try {
          const rawRes = await axios.get(file.raw_url, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            timeout: 10000,
          });
          const fileContent = rawRes.data;
          if (fileContent && typeof fileContent === 'string' && fileContent.length > 0) {
            patch = `// File: ${normalizedPath}\n// Status: ${file.status}\n\n${fileContent.substring(0, 1000)}${fileContent.length > 1000 ? '\n// ... (content truncated)' : ''}`;
          }
        } catch (err: any) {
          patch = `// Binary or inaccessible file: ${normalizedPath}`;
        }
      }
      
      // Fallback patch if still empty
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

      // Check if file already exists in database
      if (!existingFilesMap.has(normalizedPath)) {
        filesToSave.push({
          sha,
          path: normalizedPath,
          content: fileData,
          commitId: commit.id,
        });
      } else {
        console.log(`Already in database - will use existing record`);
      }

      // Add to response list
      allFiles.push({
        path: normalizedPath,
        status: fileData.status,
        additions: fileData.additions,
        deletions: fileData.deletions,
        changes: fileData.changes,
        patch: fileData.patch,
        sha: sha,
        id: existingFilesMap.get(normalizedPath)?.id || 0
      });
    }

    // Save new files to database
    if (filesToSave.length > 0) {
      console.log(`\n Saving ${filesToSave.length} new files to database...`);
      
      for (const fileToSave of filesToSave) {
        try {
          const savedFile = await prisma.commitFile.create({
            data: fileToSave,
          });
          console.log(`Saved: ${fileToSave.path}`);
          
          const fileIndex = allFiles.findIndex((f : any) => f.path === fileToSave.path);
          if (fileIndex >= 0) {
            allFiles[fileIndex].id = savedFile.id;
          }
        } catch (err: any) {
          try {
            await prisma.commitFile.update({
              where: { sha_path: { sha, path: fileToSave.path } },
              data: { content: fileToSave.content },
            });
          } catch (updateErr: any) {
            console.error(`Failed to update ${fileToSave.path}:`, updateErr.message);
          }
        }
      }
    }

    return res.status(200).json({
      message: "Commit details fetched successfully",
      files: allFiles,
      commitInfo: {
        sha: commitRes.data.sha,
        message: commitRes.data.commit?.message || '',
        author: commitRes.data.commit?.author?.name || '',
        date: commitRes.data.commit?.author?.date || new Date(),
        totalChanges: allFiles.reduce((sum : any, file :any) => sum + (file.changes || 0), 0)
      }
    });
  } catch (error: any) {
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

  if (!sha) {
    return res.status(400).json({ message: "Commit SHA is required for saving analysis" });
  }

  try {
    // Step 1: Find commit in database
    const commit = await prisma.commit.findUnique({
      where: { sha },
      include: { Repo: true }
    });

    if (!commit) {
      return res.status(404).json({ message: "Commit not found in database. Please sync commits first." });
    }

    const repoId = commit.Repo.id;
    const commitId = commit.id;

    // Step 2: Create a scan record
let scan = await prisma.scan.upsert({
  where: {
    repoId_commitId: {
      repoId: repoId,
      commitId: commitId
    }
  },
  update: {
    status: "RUNNING",
    score: null,
    grade: null
  },
  create: {
    repoId: repoId,
    commitId: commitId,
    status: "RUNNING"
  }
});

    // Step 3: Call AI service
    const codeLength = code.length;
    const calculatedTimeout = Math.max(60000, Math.min(120000, Math.ceil(codeLength / 50)));
    
    const aiResponse = await axios.post(`${AI_SERVICE_URL}/analyze`, {
      code: code,
      analysis_type: analysisType
    }, {
      timeout: calculatedTimeout
    });

    const analysis = aiResponse.data.analysis;
    const correctedExamples = aiResponse.data.corrected_examples || [];

    // Step 4: Parse analysis into issues
    const issues = parseAnalysisToIssues(analysis);

    // Step 5: Save issues to database
    if (issues.length > 0) {
      await prisma.issue.createMany({
        data: issues.map(issue => ({
          ...issue,
          scanId: scan.id,
          commitId: commitId
        }))
      });
    }

    // Step 6: Calculate score and grade
    const score = calculateScore(issues);
    const grade = calculateGrade(score);

    // Step 7: Update scan with results
    scan = await prisma.scan.update({
      where: { id: scan.id },
      data: {
        status: "COMPLETED",
        score,
        grade
      },
      include: {
        issues: true,
        Repo: { select: { name: true } },
        Commit: { select: { message: true, author: true } }
      }
    });

    // Step 8: Return response
    res.status(200).json({
      message: "Code analysis completed and saved",
      scan: scan,
      analysis: analysis,
      correctedExamples: correctedExamples,
      analysisType: analysisType,
      issuesCount: issues.length,
      score: score,
      grade: grade,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    let errorMessage = error.message;
    let statusCode = 500;
    
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      errorMessage = `Analysis timeout: The AI service took too long to analyze this code. This usually happens with very large code samples. Try analyzing smaller chunks or individual files.`;
      statusCode = 408; 
    } else if (error.message?.includes('ECONNREFUSED')) {
      errorMessage = `AI service is not available at ${AI_SERVICE_URL}. Please check if the AI service is running.`;
      statusCode = 503; 
    }
    res.status(statusCode).json({ 
      message: "Failed to analyze code with AI",
      error: errorMessage,
      serviceUrl: AI_SERVICE_URL,
      timestamp: new Date().toISOString()
    });
  }
};

export const chatWithAI = async (req: Request, res: Response) => {
  const { code, repoId, analysisType = "chatbot" } = req.body;
  const userId = (req as any).user?.userId;

  if (!code) {
    return res.status(400).json({ message: "Code/query is required" });
  }

  if (!repoId) {
    return res.status(400).json({ message: "Repository ID is required" });
  }

  if (!userId) {
    return res.status(401).json({ message: "User authentication required" });
  }

  try {
    // Verify repo exists and user has access
    const repo = await prisma.repo.findUnique({
      where: { id: repoId }
    });

    if (!repo) {
      return res.status(404).json({ message: "Repository not found" });
    }

    // Call AI service
    const codeLength = code.length;
    const calculatedTimeout = Math.max(60000, Math.min(120000, Math.ceil(codeLength / 50)));
    
    const aiResponse = await axios.post(`${AI_SERVICE_URL}/analyze`, {
      code: code,
      analysis_type: analysisType
    }, {
      timeout: calculatedTimeout
    });

    const analysis = aiResponse.data.analysis;

    // Save chat discussion to database
    const discussion = await prisma.chatDiscussion.create({
      data: {
        userQuery: code,
        aiResponse: typeof analysis === 'string' ? analysis : JSON.stringify(analysis),
        context: `Analysis type: ${analysisType}`,
        repoId: repoId,
        userId: userId
      }
    });

    res.status(200).json({
      message: "AI analysis completed",
      analysis: analysis,
      discussionId: discussion.id
    });
  } catch (error: any) {
    let statusCode = 500;
    let errorMessage = error.message || "Failed to get AI response";

    console.error("Chat with AI error:", error);

    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      errorMessage = `Analysis timeout: The AI service took too long to respond. Please try again.`;
      statusCode = 408;
    } else if (error.message?.includes('ECONNREFUSED')) {
      errorMessage = `AI service is not available. Please try again later.`;
      statusCode = 503;
    }

    res.status(statusCode).json({
      message: "Failed to get AI response",
      error: errorMessage,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Parse AI analysis text into structured Issue objects
 */
function parseAnalysisToIssues(analysisText: string) {
  const issues: any[] = [];

  if (!analysisText || typeof analysisText !== 'string') {
    return issues;
  }

  // Split by lines and parse issues
  const lines = analysisText.split('\n').filter(line => line.trim());

  for (const line of lines) {
    const issue = parseSingleIssue(line);
    if (issue) {
      issues.push(issue);
    }
  }

  return issues;
}

function parseSingleIssue(text: string) {
  if (!text || text.trim().length < 10) {
    return null;
  }

  let severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" = "MEDIUM";
  let message = text;

  if (text.toUpperCase().includes("CRITICAL")) {
    severity = "CRITICAL";
    message = text.replace(/\*\*CRITICAL\*\*|CRITICAL/i, "").trim();
  } else if (text.toUpperCase().includes("HIGH")) {
    severity = "HIGH";
    message = text.replace(/\*\*HIGH\*\*|HIGH/i, "").trim();
  } else if (text.toUpperCase().includes("MEDIUM")) {
    severity = "MEDIUM";
    message = text.replace(/\*\*MEDIUM\*\*|MEDIUM/i, "").trim();
  } else if (text.toUpperCase().includes("LOW")) {
    severity = "LOW";
    message = text.replace(/\*\*LOW\*\*|LOW/i, "").trim();
  }

  let type: "BUG" | "VULNERABILITY" | "CODE_SMELL" = "CODE_SMELL";
  if (message.toUpperCase().includes("SECURITY") || message.toUpperCase().includes("INJECTION")) {
    type = "VULNERABILITY";
  } else if (message.toUpperCase().includes("ERROR") || message.toUpperCase().includes("BUG")) {
    type = "BUG";
  }

  return {
    title: message.split('\n')[0]?.substring(0, 100) || "Issue detected",
    message: message,
    type,
    severity,
    filePath: "unknown",
    agent: "clean_code",
    confidence: 0.8,
    tags: ["auto-detected"]
  };
}


function calculateScore(issues: any[]): number {
  if (issues.length === 0) return 100;

  let score = 100;
  for (const issue of issues) {
    switch (issue.severity) {
      case "CRITICAL":
        score -= 10;
        break;
      case "HIGH":
        score -= 5;
        break;
      case "MEDIUM":
        score -= 2;
        break;
      case "LOW":
        score -= 1;
        break;
    }
  }

  return Math.max(0, score);
}


function calculateGrade(score: number): string {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}
