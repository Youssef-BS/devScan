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
    const paginatedRepos = allRepos.slice(offset, offset + limit);

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
        },
      });
    }
  } catch (error) {
    console.error('saveGithubRepos error:', error);
  }
};


// export const getRepoByName = async (req: Request, res: Response) => {
//     try  {
//         if(!req.session.user) {
//             return res.status(401).json({ message: 'Not authenticated' });
//         }
//         const { name } = req.params;
//         const dbUser = await prisma
//     }catch (error) {    
//         console.error('getRepoByName error:', error);
//         res.status(500).json({ message: 'Failed to fetch repository' });
//     }
// }