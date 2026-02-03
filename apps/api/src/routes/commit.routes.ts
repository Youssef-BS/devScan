import { Router } from "express";
import {
  fetchAndSaveAllCommits,
  getAllCommits,
  commitDetails
} from "../controllers/Commit.controller";

const router: Router = Router();

router.get("/fetch/:githubId", fetchAndSaveAllCommits);
router.get("/:githubId", getAllCommits);
router.get("/:sha/details", commitDetails);


export default router;
