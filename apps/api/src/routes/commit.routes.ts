import { Router } from "express";
import {
  fetchAndSaveAllCommits,
  getAllCommits,
} from "../controllers/Commit.controller";

const router: Router = Router();

router.get("/fetch/:githubId", fetchAndSaveAllCommits);
router.get("/:githubId", getAllCommits);

export default router;
