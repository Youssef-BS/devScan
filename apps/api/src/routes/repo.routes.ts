import { Router, Request, Response } from "express";
import { deleteAllGithubRepos,
   getGithubRepos,
   saveGithubRepos, 
   getAllRepoFromDbByUser, 
   saveGithubRepo, 
   getRepoDetails, 
   getAllRepos,
   deleteRepoByAdmin ,
   addRepoByAdmin
  } 
   from "../controllers/Repo.controller.js";
   import { auth } from "../middleware/auth.js" ;
   import { AuthRequest } from "../middleware/auth.js" ;

import axios from "axios";

import { prisma } from "../db.js";
import { isAdmin } from "src/middleware/isAdmin.js";
import { isBanned } from "src/middleware/isBanned.js";

const router : Router = Router();

router.get("/",auth, isBanned , getGithubRepos);


router.get("/all-db",auth, isBanned , getAllRepoFromDbByUser);

router.post("/sync", auth, isBanned , async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: req.user.userId }, 
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

    await saveGithubRepos(req.user.userId, allRepos);

    res.json({ 
      message: `Synced ${allRepos.length} repositories successfully`,
      count: allRepos.length,
    });
  } catch (error) {
    console.error("Sync error:", error);
    res.status(500).json({ message: "Failed to sync repositories" });
  }
});


router.delete("/clear", auth, isBanned , deleteAllGithubRepos) ;
router.post("/save" , auth, isBanned , saveGithubRepo) ;


// Admin routes

router.get("/get-all-db", auth, isAdmin , isBanned , getAllRepos) ;
router.delete("/delete/:githubId" , auth, isAdmin, isBanned, deleteRepoByAdmin) ;
router.post("/save-single", auth, isAdmin , isBanned , addRepoByAdmin) ;
//---
router.get('/:githubId' , auth, isBanned , getRepoDetails) ;

export default router ;
