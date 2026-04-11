import axios from "axios";
import { Request, Response } from "express";
import { prisma } from "../db.js";

// ─── Helper ───────────────────────────────────────────────────────────────

async function getRepoWithToken(githubId: string) {
  return prisma.repo.findUnique({
    where: { githubId },
    include: { User: { select: { accessToken: true } } },
  });
}

const ghHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
  Accept: "application/vnd.github+json",
});

// ─── List Pull Requests ───────────────────────────────────────────────────

export const listPullRequests = async (req: Request, res: Response) => {
  const { githubId } = req.params;
  const { state = "open" } = req.query;

  try {
    const repo = await getRepoWithToken(githubId);
    if (!repo) return res.status(404).json({ message: "Repository not found" });

    const token = repo.User?.accessToken || process.env.GITHUB_ACCESS_TOKEN;
    if (!token) return res.status(401).json({ message: "No GitHub access token" });

    const response = await axios.get(
      `https://api.github.com/repos/${repo.fullName}/pulls`,
      { headers: ghHeaders(token), params: { state, per_page: 30 } },
    );

    return res.json(
      response.data.map((pr: any) => ({
        number:      pr.number,
        title:       pr.title,
        body:        pr.body || "",
        state:       pr.state,
        draft:       pr.draft ?? false,
        author:      pr.user?.login || "Unknown",
        avatarUrl:   pr.user?.avatar_url || "",
        url:         pr.html_url,
        headSha:     pr.head?.sha,
        headBranch:  pr.head?.ref,
        baseBranch:  pr.base?.ref,
        labels:      (pr.labels ?? []).map((l: any) => l.name),
        createdAt:   pr.created_at,
        updatedAt:   pr.updated_at,
      })),
    );
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};

// ─── Get File Content ─────────────────────────────────────────────────────

export const getFileContent = async (req: Request, res: Response) => {
  const { githubId } = req.params;
  const { path: filePath, ref = "main" } = req.query;

  if (!filePath || typeof filePath !== "string") {
    return res.status(400).json({ message: "Query param `path` is required" });
  }

  try {
    const repo = await getRepoWithToken(githubId);
    if (!repo) return res.status(404).json({ message: "Repository not found" });

    const token = repo.User?.accessToken || process.env.GITHUB_ACCESS_TOKEN;
    if (!token) return res.status(401).json({ message: "No GitHub access token" });

    const response = await axios.get(
      `https://api.github.com/repos/${repo.fullName}/contents/${filePath}`,
      { headers: ghHeaders(token), params: { ref } },
    );

    // GitHub returns base64-encoded content (may contain newlines)
    const rawB64   = (response.data.content as string).replace(/\n/g, "");
    const content  = Buffer.from(rawB64, "base64").toString("utf-8");

    return res.json({
      content,
      sha:  response.data.sha,
      path: response.data.path,
      size: response.data.size,
    });
  } catch (err: any) {
    if (err.response?.status === 404) {
      return res.status(404).json({ message: "File not found in repository" });
    }
    return res.status(500).json({ message: err.message });
  }
};

// ─── Apply Fix (direct push or create PR) ────────────────────────────────

export const applyFix = async (req: Request, res: Response) => {
  const { githubId } = req.params;
  const {
    filePath,
    newContent,
    commitMessage = "Apply AI-suggested fix (DevScan)",
    createPR       = false,
    prTitle,
    prBody,
    branch         = "main",
  } = req.body;

  if (!filePath || !newContent) {
    return res.status(400).json({ message: "`filePath` and `newContent` are required" });
  }

  try {
    const repo = await getRepoWithToken(githubId);
    if (!repo) return res.status(404).json({ message: "Repository not found" });

    const token = repo.User?.accessToken;
    if (!token) return res.status(401).json({ message: "GitHub access token required" });

    const headers    = ghHeaders(token);
    const b64Content = Buffer.from(newContent).toString("base64");

    if (createPR) {
      // ── Create branch → push file → open PR ─────────────────────────────

      // 1. Get HEAD SHA of the base branch
      const refRes  = await axios.get(
        `https://api.github.com/repos/${repo.fullName}/git/ref/heads/${branch}`,
        { headers },
      );
      const baseSha = refRes.data.object.sha;

      // 2. Create a new feature branch
      const newBranch = `ai-fix-${Date.now()}`;
      await axios.post(
        `https://api.github.com/repos/${repo.fullName}/git/refs`,
        { ref: `refs/heads/${newBranch}`, sha: baseSha },
        { headers },
      );

      // 3. Get current file SHA on the new branch
      const fileRes = await axios.get(
        `https://api.github.com/repos/${repo.fullName}/contents/${filePath}`,
        { headers, params: { ref: newBranch } },
      );

      // 4. Commit the updated file to the new branch
      await axios.put(
        `https://api.github.com/repos/${repo.fullName}/contents/${filePath}`,
        {
          message:  commitMessage,
          content:  b64Content,
          sha:      fileRes.data.sha,
          branch:   newBranch,
        },
        { headers },
      );

      // 5. Open the Pull Request
      const prRes = await axios.post(
        `https://api.github.com/repos/${repo.fullName}/pulls`,
        {
          title: prTitle  || `AI Fix: ${filePath}`,
          body:  prBody   || `**AI-generated fix from DevScan**\n\n**File:** \`${filePath}\`\n\n${commitMessage}`,
          head:  newBranch,
          base:  branch,
        },
        { headers },
      );

      return res.json({
        type:      "pr",
        prUrl:     prRes.data.html_url,
        prNumber:  prRes.data.number,
        branch:    newBranch,
      });

    } else {
      // ── Direct push to branch ────────────────────────────────────────────

      // Get current file SHA
      const fileRes = await axios.get(
        `https://api.github.com/repos/${repo.fullName}/contents/${filePath}`,
        { headers, params: { ref: branch } },
      );

      const updateRes = await axios.put(
        `https://api.github.com/repos/${repo.fullName}/contents/${filePath}`,
        {
          message: commitMessage,
          content: b64Content,
          sha:     fileRes.data.sha,
          branch,
        },
        { headers },
      );

      return res.json({
        type:       "push",
        commitSha:  updateRes.data.commit.sha,
        commitUrl:  updateRes.data.commit.html_url,
        branch,
      });
    }

  } catch (err: any) {
    const detail = err.response?.data?.message || err.message;
    return res.status(500).json({ message: `Failed to apply fix: ${detail}` });
  }
};
