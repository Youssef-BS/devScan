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
    console.log("\n================== FETCHING COMMIT DETAILS ==================");
    console.log("📌 Commit SHA:", sha);
    
    // Get commit info
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
      console.error("❌ Commit not found in database");
      return res.status(404).json({ message: "Commit not found in database" });
    }

    const accessToken = commit.Repo.User?.accessToken || process.env.GITHUB_ACCESS_TOKEN;
    
    if (!accessToken) {
      console.error("❌ No GitHub access token available");
      return res.status(400).json({ 
        message: "GitHub access token missing. Please reconnect your GitHub account." 
      });
    }

    // ALWAYS fetch from GitHub to get complete list
    console.log(`🌐 Fetching from GitHub: ${commit.Repo.fullName}/commits/${sha}`);
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
      console.log("⚠️ No file changes found in this commit");
      return res.status(404).json({ message: "No file changes found in this commit" });
    }

    console.log(`📥 GitHub returned ${githubFiles.length} files`);
    console.log("📂 GitHub files:");
    githubFiles.forEach((file: any, idx: number) => {
      console.log(`   ${idx + 1}/${githubFiles.length}. ${file.filename} (${file.status}) +${file.additions}/-${file.deletions}`);
    });

    // Get existing files from database
    const existingFiles = await prisma.commitFile.findMany({
      where: { sha },
      orderBy: { path: 'asc' }
    });

    console.log(`\n💾 Found ${existingFiles.length} files in database for SHA: ${sha}`);
    
    // Create a map of existing files for quick lookup
    const existingFilesMap = new Map(existingFiles.map(f => [f.path, f]));
    
    const allFiles = [];
    const filesToSave = [];

    // Process all files from GitHub
    for (const file of githubFiles) {
      const normalizedPath = (file.filename || '').replace(/\\/g, '/');
      
      if (!normalizedPath) {
        console.warn("⚠️ Skipping file with missing filename");
        continue;
      }

      console.log(`\n🔄 Processing: ${normalizedPath}`);

      let patch = file.patch || '';
      
      // Try to fetch raw content if patch is empty
      if (!patch && file.raw_url) {
        try {
          console.log(`  📄 Fetching raw content...`);
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
          console.warn(`  ⚠️ Could not fetch raw content:`, err.message);
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
        console.log(`  ✅ New file - will save to database`);
        filesToSave.push({
          sha,
          path: normalizedPath,
          content: fileData,
          commitId: commit.id,
        });
      } else {
        console.log(`  ℹ️ Already in database - will use existing record`);
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
      console.log(`\n💾 Saving ${filesToSave.length} new files to database...`);
      
      for (const fileToSave of filesToSave) {
        try {
          const savedFile = await prisma.commitFile.create({
            data: fileToSave,
          });
          console.log(`  ✅ Saved: ${fileToSave.path}`);
          
          // Update ID in allFiles
          const fileIndex = allFiles.findIndex(f => f.path === fileToSave.path);
          if (fileIndex >= 0) {
            allFiles[fileIndex].id = savedFile.id;
          }
        } catch (err: any) {
          console.error(`  ❌ Failed to save ${fileToSave.path}:`, err.message);
          // Try to update if it already exists
          try {
            await prisma.commitFile.update({
              where: { sha_path: { sha, path: fileToSave.path } },
              data: { content: fileToSave.content },
            });
            console.log(`  ✅ Updated: ${fileToSave.path}`);
          } catch (updateErr: any) {
            console.error(`  ❌ Failed to update ${fileToSave.path}:`, updateErr.message);
          }
        }
      }
    }

    console.log(`\n📤 Response Summary:`);
    console.log(`   Total files: ${allFiles.length}`);
    console.log(`   Added: ${allFiles.filter(f => f.status === 'added').length}`);
    console.log(`   Modified: ${allFiles.filter(f => f.status === 'modified').length}`);
    console.log(`   Removed: ${allFiles.filter(f => f.status === 'removed').length}`);
    console.log(`   Renamed: ${allFiles.filter(f => f.status === 'renamed').length}`);
    console.log("===========================================================\n");

    return res.status(200).json({
      message: "Commit details fetched successfully",
      files: allFiles,
      commitInfo: {
        sha: commitRes.data.sha,
        message: commitRes.data.commit?.message || '',
        author: commitRes.data.commit?.author?.name || '',
        date: commitRes.data.commit?.author?.date || new Date(),
        totalChanges: allFiles.reduce((sum, file) => sum + (file.changes || 0), 0)
      }
    });
  } catch (error: any) {
    console.error("\n❌ getCommitDetails error:", error.response?.data || error.message);
    console.log("===========================================================\n");
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
    console.log("⏳ Sending code to AI service for analysis...", { 
      analysisType,
      codeLength: code.length,
      estimatedTime: `${Math.ceil(code.length / 1000)}s`
    });
    
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
    console.log("✅ AI analysis completed successfully", { 
      examplesCount: correctedExamples.length 
    });

    res.status(200).json({
      message: "Code analysis completed",
      analysis: analysis,
      correctedExamples: correctedExamples,
      analysisType: analysisType,
      sha: sha || null,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    let errorMessage = error.message;
    let statusCode = 500;
    
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      errorMessage = `Analysis timeout: The AI service took too long to analyze this code. This usually happens with very large code samples. Try analyzing smaller chunks or individual files.`;
      statusCode = 408; // Request Timeout
    } else if (error.message?.includes('ECONNREFUSED')) {
      errorMessage = `AI service is not available at ${AI_SERVICE_URL}. Please check if the AI service is running.`;
      statusCode = 503; // Service Unavailable
    }
    
    console.error("AI analysis error:", statusCode, errorMessage);
    res.status(statusCode).json({ 
      message: "Failed to analyze code with AI",
      error: errorMessage,
      serviceUrl: AI_SERVICE_URL,
      timestamp: new Date().toISOString()
    });
  }
};
