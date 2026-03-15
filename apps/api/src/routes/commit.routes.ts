import { Router } from "express";
import {
  fetchAndSaveAllCommits,
  getAllCommits,
  getCommitDetails,
  analyzeCommitWithAI
} from "../controllers/Commit.controller" ;
import { auth } from "../middleware/auth.js" ;
import { isBanned } from "src/middleware/isBanned";

const router: Router = Router();
router.get("/fetch/:githubId", auth, isBanned , fetchAndSaveAllCommits);
router.get("/repo/:githubId", auth, isBanned , getAllCommits);
router.get("/details/:sha", auth, isBanned , getCommitDetails);
router.post("/analyze", auth, isBanned , analyzeCommitWithAI);

export default router;