import { Request, Response } from "express";
import axios from "axios";
import { prisma } from "../db.js";
import { AuthRequest } from "../middleware/auth.js";


export const saveGithubRepos = async (userId: number, repos: any[]) => {
  try {
    for (const repo of repos) {
      await prisma.repo.upsert({
        where: { githubId: String(repo.id) },
        update: {
          name: repo.name,
          fullName: repo.full_name,
          htmlUrl: repo.html_url,
          description: repo.description,
          language: repo.language,
          private: repo.private,
          fork: repo.fork,
          autoAudit: repo.auto_audit ?? true,
        },
        create: {
          githubId: String(repo.id),
          name: repo.name,
          fullName: repo.full_name,
          htmlUrl: repo.html_url,
          description: repo.description,
          language: repo.language,
          private: repo.private,
          fork: repo.fork,
          ownerId: userId,
          autoAudit: repo.auto_audit ?? true,
        },
      });
    }
  } catch (error) {
    console.error("saveGithubRepos error:", error);
  }
};


export const getGithubRepos = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Not authenticated" });

    const userId = req.user.userId;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 9;
    const search = String(req.query.search || "");
    const language = String(req.query.language || "all");
    const offset = (page - 1) * limit;

    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { accessToken: true },
    });

    if (!dbUser?.accessToken) {
      return res.status(400).json({ message: "No GitHub access token" });
    }

    let allRepos: any[] = [];
    let ghPage = 1;
    let hasMore = true;

    while (hasMore) {
      const response = await axios.get("https://api.github.com/user/repos", {
        headers: {
          Authorization: `Bearer ${dbUser.accessToken}`,
          Accept: "application/vnd.github+json",
        },
        params: {
          per_page: 100,
          page: ghPage,
          visibility: "all",
        },
      });

      if (response.data.length) {
        allRepos.push(...response.data);
        ghPage++;
      } else {
        hasMore = false;
      }
    }

    const filteredRepos = allRepos.filter((repo) => {
      const matchesSearch = repo.name.toLowerCase().includes(search.toLowerCase());
      const matchesLanguage = language === "all" || repo.language?.toLowerCase() === language.toLowerCase();
      return matchesSearch && matchesLanguage;
    });

    const total = filteredRepos.length;
    const paginatedRepos = filteredRepos.slice(offset, offset + limit);

    res.json({
      data: paginatedRepos.map((repo) => ({ ...repo, githubId: String(repo.id) })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("getGithubRepos error:", error);
    res.status(500).json({ message: "Failed to fetch repositories" });
  }
};

export const getAllRepoFromDbByUser = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Not authenticated" });

    const userId = req.user.userId;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 9;
    const offset = (page - 1) * limit;

    // Get repos where user is OWNER or is an ACTIVE COLLABORATOR
    const [repos, total] = await Promise.all([
      prisma.repo.findMany({
        where: {
          OR: [
            { ownerId: userId },
            {
              collaborators: {
                some: {
                  userId: userId,
                  isActive: true,
                },
              },
            },
          ],
        },
        skip: offset,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.repo.count({
        where: {
          OR: [
            { ownerId: userId },
            {
              collaborators: {
                some: {
                  userId: userId,
                  isActive: true,
                },
              },
            },
          ],
        },
      }),
    ]);

    res.json({
      data: repos,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("getAllRepoFromDbByUser error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteGithubRepo = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Not authenticated" });

    const { githubId } = req.params;
    await prisma.repo.deleteMany({
      where: {
        githubId: String(githubId),
        ownerId: req.user.userId,
      },
    });

    res.json({ message: "Repository deleted successfully" });
  } catch (error) {
    console.error("deleteGithubRepo error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteAllGithubRepos = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Not authenticated" });

    await prisma.repo.deleteMany({ where: { ownerId: req.user.userId } });

    res.json({ message: "All repositories deleted successfully" });
  } catch (error) {
    console.error("deleteAllGithubRepos error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const saveGithubRepo = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Not authenticated" });

    const userId = req.user.userId;
    const { githubId, name, fullName, htmlUrl, description, language, private: isPrivate, fork } = req.body;

    const existingRepo = await prisma.repo.findUnique({
      where: { githubId: String(githubId) },
    });

    if (existingRepo) return res.status(400).json({ message: "Repository already saved" });

    const newRepo = await prisma.repo.create({
      data: {
        githubId: String(githubId),
        name,
        fullName,
        htmlUrl,
        description,
        language,
        private: isPrivate,
        fork,
        ownerId: userId,
        autoAudit: true,
      },
    });

    res.status(201).json({ message: "Repository saved successfully", repo: newRepo });
  } catch (error) {
    console.error("saveGithubRepo error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getRepoDetails = async (req: Request, res: Response) => {
  try {
    const githubId = req.params.githubId;
    const repo = await prisma.repo.findUnique({ where: { githubId: String(githubId) } });

    if (!repo) return res.status(404).json({ message: "Repository not found" });

    res.json(repo);
  } catch (error) {
    console.error("getRepoDetails error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllRepos = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 9;
    const offset = (page - 1) * limit;

    const [repos, total] = await Promise.all([
      prisma.repo.findMany({ skip: offset, take: limit }),
      prisma.repo.count(),
    ]);

    res.json({
      data: repos,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("getAllRepos error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteRepoByAdmin = async (req: Request, res: Response) => {
  try {
    const { githubId } = req.params;
    await prisma.repo.deleteMany({ where: { githubId: String(githubId) } });
    res.json({ message: "Repository deleted successfully" });
  } catch (error) {
    console.error("deleteRepoByAdmin error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Not authenticated" });

    const userId = req.user.userId;

    const repos = await prisma.repo.findMany({
      where: { ownerId: userId },
      include: {
        scans: {
          include: { issues: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    const allIssues = repos.flatMap((r) => r.scans.flatMap((s) => s.issues));

    const issuesBySeverity = {
      critical: allIssues.filter((i) => i.severity === "CRITICAL").length,
      high:     allIssues.filter((i) => i.severity === "HIGH").length,
      medium:   allIssues.filter((i) => i.severity === "MEDIUM").length,
      low:      allIssues.filter((i) => i.severity === "LOW").length,
    };

    const issuesByAgent = {
      security:    allIssues.filter((i) => i.agent === "security").length,
      performance: allIssues.filter((i) => i.agent === "performance").length,
      clean_code:  allIssues.filter((i) => i.agent === "clean_code").length,
      bug:         allIssues.filter((i) => i.agent === "bug").length,
    };

    const issuesByStatus = {
      open:      allIssues.filter((i) => i.status === "OPEN").length,
      fixed:     allIssues.filter((i) => i.status === "FIXED").length,
      confirmed: allIssues.filter((i) => i.status === "CONFIRMED").length,
      ignored:   allIssues.filter((i) => i.status === "IGNORED").length,
    };

    // Recent 5 scans across all repos
    const allScans = repos
      .flatMap((r) =>
        r.scans.map((s) => ({
          repoName:   r.name,
          issueCount: s.issues.length,
          status:     s.status,
          score:      s.score,
          grade:      s.grade,
          createdAt:  s.createdAt,
        }))
      )
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 5);

    // Language distribution
    const langMap = new Map<string, number>();
    for (const repo of repos) {
      const lang = repo.language || "Unknown";
      langMap.set(lang, (langMap.get(lang) ?? 0) + 1);
    }
    const languageDistribution = Array.from(langMap.entries())
      .map(([language, count]) => ({
        language,
        count,
        percentage: repos.length > 0 ? Math.round((count / repos.length) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);

    // Top repos by total issue count
    const topReposByIssues = repos
      .map((r) => ({
        name:       r.name,
        language:   r.language,
        issueCount: r.scans.flatMap((s) => s.issues).length,
        score:      r.scans[0]?.score ?? null,
        grade:      r.scans[0]?.grade ?? null,
      }))
      .sort((a, b) => b.issueCount - a.issueCount)
      .slice(0, 5);

    // Average scan score
    const scansWithScore = repos.flatMap((r) => r.scans).filter((s) => s.score !== null);
    const avgScore =
      scansWithScore.length > 0
        ? Math.round(scansWithScore.reduce((acc, s) => acc + (s.score ?? 0), 0) / scansWithScore.length)
        : null;

    // Most common issue titles
    const titleCount = new Map<string, number>();
    allIssues.forEach((i) => {
      titleCount.set(i.title, (titleCount.get(i.title) ?? 0) + 1);
    });
    const topIssues = Array.from(titleCount.entries())
      .map(([title, count]) => ({ title, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return res.json({
      overview: {
        totalRepos:       repos.length,
        privateRepos:     repos.filter((r) => r.private).length,
        publicRepos:      repos.filter((r) => !r.private).length,
        autoAuditEnabled: repos.filter((r) => r.autoAudit).length,
        totalScans:       repos.flatMap((r) => r.scans).length,
        totalIssues:      allIssues.length,
        openIssues:       issuesByStatus.open,
        fixedIssues:      issuesByStatus.fixed,
        avgScore,
      },
      issuesBySeverity,
      issuesByAgent,
      issuesByStatus,
      recentScans:         allScans,
      languageDistribution,
      topReposByIssues,
      topIssues,
    });
  } catch (error) {
    console.error("getAnalytics error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const addRepoByAdmin = async (req: Request, res: Response) => {
  try {
    const { githubId, name, fullName, htmlUrl, description, language, private: isPrivate, fork, ownerId } = req.body;

    const existingRepo = await prisma.repo.findUnique({ where: { githubId: String(githubId) } });
    if (existingRepo) return res.status(400).json({ message: "Repository already exists" });

    const newRepo = await prisma.repo.create({
      data: { githubId: String(githubId), name, fullName, htmlUrl, description, language, private: isPrivate, fork, ownerId, autoAudit: true },
    });

    res.status(201).json({ message: "Repository added successfully", repo: newRepo });
  } catch (error) {
    console.error("addRepoByAdmin error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};