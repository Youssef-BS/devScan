import { Router } from "express";
import {
  fetchAndSaveAllCommits,
  getAllCommits,
  getCommitDetails,
  analyzeCommitWithAI,
  chatWithAI
} from "../controllers/Commit.controller.js" ;
import { auth } from "../middleware/auth.js" ;
import { isBanned } from "../middleware/isBanned.js";

const router: Router = Router();
router.get("/fetch/:githubId", auth, isBanned , fetchAndSaveAllCommits);
router.get("/repo/:githubId", auth, isBanned , getAllCommits);
router.get("/details/:sha", auth, isBanned , getCommitDetails);
router.post("/analyze", auth, isBanned , analyzeCommitWithAI);
router.post("/chat", auth, isBanned , chatWithAI);

export default router;