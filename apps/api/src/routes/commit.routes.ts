import { Router } from "express";
import {
  fetchAndSaveAllCommits,
  getAllCommits,
  getCommitDetails,
  analyzeCommitWithAI
} from "../controllers/Commit.controller" ;
import { auth } from "../middleware/auth.js" ;

const router: Router = Router();
router.get("/fetch/:githubId", auth, fetchAndSaveAllCommits);
router.get("/repo/:githubId", auth, getAllCommits);
router.get("/details/:sha", auth, getCommitDetails);
router.post("/analyze", auth, analyzeCommitWithAI);

export default router;