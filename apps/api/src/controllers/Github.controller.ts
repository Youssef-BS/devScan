import { Request, Response } from 'express';
import axios from 'axios';
import { prisma } from '../db';


export const getGithubRepos = async (req: Request, res: Response) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 9; 
    const offset = (page - 1) * limit;

    const dbUser = await prisma.user.findUnique({
      where: { githubId: String(req.session.user.id) },
      select: { accessToken: true },
    });

    if (!dbUser?.accessToken) {
      return res.status(400).json({ message: 'No GitHub access token' });
    }

    let allRepos: any[] = [];
    let ghPage = 1;
    let hasMore = true;

    while (hasMore) {
      const response = await axios.get('https://api.github.com/user/repos', {
        headers: {
          Authorization: `Bearer ${dbUser.accessToken}`,
          Accept: 'application/vnd.github+json',
        },
        params: {
          per_page: 100,
          page: ghPage,
          visibility: 'all',
        },
      });

      if (response.data.length > 0) {
        allRepos.push(...response.data);
        ghPage++;
      } else {
        hasMore = false;
      }
    }

    const total = allRepos.length;
    const mappedRepos = allRepos.map((repo: any) => ({
      ...repo,
      githubId: String(repo.id),
    }));
    const paginatedRepos = mappedRepos.slice(offset, offset + limit);

    res.json({
      data: paginatedRepos,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('getGithubRepos error:', error);
    res.status(500).json({ message: 'Failed to fetch repositories' });
  }
};

export const saveGithubRepos = async (githubUserId: string, repos: any[]) => {
  try {
    const user = await prisma.user.findUnique({
      where: { githubId: githubUserId },
      select: { id: true },
    });

    if (!user) return;

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
          autoAudit : repo.auto_audit ,
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
          ownerId: user.id,
          autoAudit : repo.auto_audit ,
        },
      });
    }
  } catch (error) {
    console.error('saveGithubRepos error:', error);
  }
};


export const getAllRepoFromDbByUser = async (req: Request, res: Response) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 9;
    const offset = (page - 1) * limit;

    const dbUser = await prisma.user.findUnique({
      where: { githubId: String(req.session.user.id) },
      select: { id: true },
    });

    if (!dbUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const [repos, total] = await Promise.all([
      prisma.repo.findMany({
        where: { ownerId: dbUser.id },
        skip: offset,
        take: limit,
      }),
      prisma.repo.count({
        where: { ownerId: dbUser.id },
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
    console.error('getAllRepoFromDbByUser error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateRepoAutoAudit = async (req: Request, res: Response) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const { full_name } = req.params;
    const { auto_audit } = req.body;

    const dbUser = await prisma.user.findUnique({
      where: { githubId: String(req.session.user.id) },
      select: { id: true },
    });

    if (!dbUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updatedRepo = await prisma.repo.updateMany({
      where: {
        name: String(full_name),
        ownerId: dbUser.id,
      },
      data: {
        autoAudit: auto_audit,
      },
    });

    if (updatedRepo.count === 0) {
      return res.status(404).json({ message: 'Repository not found' });
    }

    res.json({ message: 'Repository updated successfully', autoAudit: auto_audit });
  } catch (error) {
    console.error('updateRepoAutoAudit error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}


export const deleteGithubRepo = async (res: Response , req: Request) => {
  try {
    if(!req.session.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    const { githubId } = req.params ;
    await prisma.repo.deleteMany({
      where: {
        githubId: String(githubId),
        ownerId: req.session.user.id
      }
    });
    res.json({ message: 'Repository deleted successfully' });
  }catch(error) {
    console.error('error:', error);
  }
}

export const deleteAllGithubRepos = async (req: Request, res: Response) => {
  try {
    if(!req.session.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    await prisma.repo.deleteMany({
      where: {
        githubId: req.session.user.githubId
      }});
    res.json({ message: 'All repositories deleted successfully' });
  } catch(error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
}


export const saveGithubRepo = async (req: Request, res: Response) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const githubUserId = String(req.session.user.id);
    const { githubId, name, fullName, htmlUrl, description, language, private: isPrivate, fork } = req.body;

    const dbUser = await prisma.user.findUnique({
      where: { githubId: githubUserId },
      select: { id: true },
    });

    console.log('saveGithubRepo - dbUser:', dbUser);

    if (!dbUser) {
      return res.status(401).json({ message: "User not found" });
    }

    const existingRepo = await prisma.repo.findUnique({
      where: { githubId: String(githubId) },
    });

    if (existingRepo) {
      return res.status(400).json({ message: "Repository already saved" });
    }

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
        ownerId: dbUser.id,
        autoAudit : true 
      },
    });

    return res.status(201).json({ message: "Repository saved successfully", repo: newRepo });
  } catch (error) {
    console.error('saveGithubRepo error:', error);
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return res.status(500).json({ message: errorMessage, details: String(error) });
  }
};

