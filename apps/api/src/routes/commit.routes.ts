import { Router } from "express";
import {
  fetchAndSaveAllCommits,
  getAllCommits,
  getCommitDetails,
  analyzeCommitWithAI
} from "../controllers/Commit.controller";

const router: Router = Router();
router.get("/fetch/:githubId", fetchAndSaveAllCommits);
router.get("/repo/:githubId", getAllCommits);
router.get("/details/:sha", getCommitDetails);
router.post("/analyze", analyzeCommitWithAI);

export default router;