import axios from "axios";
import { Request, Response } from "express";
import { prisma } from "../db.js";

// ─── Helpers ─────────────────────────────────────────────────────────────

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

/** Fetch the repo's actual default branch from GitHub (falls back to "main"). */
async function fetchDefaultBranch(fullName: string, token: string): Promise<string> {
  try {
    const res = await axios.get(`https://api.github.com/repos/${fullName}`, {
      headers: ghHeaders(token),
    });
    return res.data.default_branch || "main";
  } catch {
    return "main";
  }
}

// ─── List Pull Requests ───────────────────────────────────────────────────

export const listPullRequests = async (req: Request, res: Response) => {
  const githubId = req.params.githubId as string;
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
  const githubId = req.params.githubId as string;
  const { path: filePath, ref = "main" } = req.query;

  if (!filePath || typeof filePath !== "string") {
    return res.status(400).json({ message: "Query param `path` is required" });
  }

  try {
    const repo = await getRepoWithToken(githubId);
    if (!repo) return res.status(404).json({ message: "Repository not found" });

    const token = repo.User?.accessToken || process.env.GITHUB_ACCESS_TOKEN;
    if (!token) return res.status(401).json({ message: "No GitHub access token" });

    const resolvedRef = (ref === "main" || !ref)
      ? await fetchDefaultBranch(repo.fullName, token as string)
      : ref as string;

    const response = await axios.get(
      `https://api.github.com/repos/${repo.fullName}/contents/${filePath}`,
      { headers: ghHeaders(token as string), params: { ref: resolvedRef } },
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
  const githubId = req.params.githubId as string;
  const {
    filePath,
    newContent,
    commitMessage = "Apply AI-suggested fix (DevScan)",
    createPR       = false,
    prTitle,
    prBody,
    branch         = "main",
    fileSha,        // optional: blob SHA from getFileContent — skips redundant GET
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

    // Resolve actual default branch when none is explicitly provided
    const resolvedBranch = (branch === "main")
      ? await fetchDefaultBranch(repo.fullName, token)
      : branch;

    if (createPR) {
      // ── Create branch → push file → open PR ─────────────────────────────

      // 1. Get HEAD SHA of the base branch
      const refRes  = await axios.get(
        `https://api.github.com/repos/${repo.fullName}/git/ref/heads/${resolvedBranch}`,
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

      // 3. Get current file SHA on the new branch (reuse cached SHA if provided)
      const prFileSha = fileSha ?? (await axios.get(
        `https://api.github.com/repos/${repo.fullName}/contents/${filePath}`,
        { headers, params: { ref: newBranch } },
      )).data.sha;

      // 4. Commit the updated file to the new branch
      await axios.put(
        `https://api.github.com/repos/${repo.fullName}/contents/${filePath}`,
        {
          message:  commitMessage,
          content:  b64Content,
          sha:      prFileSha,
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
          base:  resolvedBranch,
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

      // Get current file SHA — skip if the frontend already provided it
      const currentSha = fileSha ?? (await axios.get(
        `https://api.github.com/repos/${repo.fullName}/contents/${filePath}`,
        { headers, params: { ref: resolvedBranch } },
      )).data.sha;

      const updateRes = await axios.put(
        `https://api.github.com/repos/${repo.fullName}/contents/${filePath}`,
        {
          message: commitMessage,
          content: b64Content,
          sha:     currentSha,
          branch:  resolvedBranch,
        },
        { headers },
      );

      return res.json({
        type:       "push",
        commitSha:  updateRes.data.commit.sha,
        commitUrl:  updateRes.data.commit.html_url,
        branch:     resolvedBranch,
      });
    }

  } catch (err: any) {
    const ghStatus  = err.response?.status;
    const ghMessage = err.response?.data?.message || err.message;

    if (ghStatus === 403) {
      return res.status(403).json({
        message: `GitHub permission denied: ${ghMessage}. Make sure your account has write access to this repository.`,
      });
    }
    if (ghStatus === 404) {
      return res.status(404).json({
        message: `File or branch not found on GitHub: ${ghMessage}. Check that the file path and branch name are correct.`,
      });
    }
    if (ghStatus === 422) {
      return res.status(422).json({
        message: `GitHub rejected the update: ${ghMessage}. The file may have changed since it was loaded — try closing and reopening the modal.`,
      });
    }

    return res.status(500).json({ message: `Failed to apply fix: ${ghMessage}` });
  }
};
