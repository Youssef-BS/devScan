import { Router } from "express";
import {
  fetchAndSaveAllCommits,
  getAllCommits,
  getCommitDetails
} from "../controllers/Commit.controller";

const router: Router = Router();
router.get("/fetch/:githubId", fetchAndSaveAllCommits);
router.get("/repo/:githubId", getAllCommits);
router.get("/details/:sha", getCommitDetails);

export default router;