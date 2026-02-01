import { Router, Request, Response } from "express";
import { deleteAllGithubRepos, getGithubRepos, saveGithubRepos, getAllRepoFromDbByUser, saveGithubRepo, getRepoDetails } from "../controllers/Repo.controller.js";
import axios from "axios";
import { prisma } from "../db.js";

const router : Router = Router();

router.get("/", getGithubRepos);


router.get("/all-db", getAllRepoFromDbByUser);

router.post("/sync", async (req: Request, res: Response) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const dbUser = await prisma.user.findUnique({
      where: { githubId: String(req.session.user.id) },
      select: { id: true, accessToken: true },
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

      if (response.data.length > 0) {
        allRepos.push(...response.data);
        ghPage++;
      } else {
        hasMore = false;
      }
    }

    await saveGithubRepos(String(req.session.user.id), allRepos);

    res.json({ 
      message: `Synced ${allRepos.length} repositories successfully`,
      count: allRepos.length,
    });
  } catch (error) {
    console.error("Sync error:", error);
    res.status(500).json({ message: "Failed to sync repositories" });
  }
});


router.delete("/clear", deleteAllGithubRepos) ;
router.post("/save" , saveGithubRepo)
router.get('/:githubId' , getRepoDetails) ;

export default router ;
