import { Router } from "express";
import { fetchAndSaveLastCommit , getLastCommit } from "../controllers/Commit.controller";

const router:Router = Router() ; 

router.get("/fetch/:githubId", fetchAndSaveLastCommit);
router.get("/:githubId", getLastCommit);


export default router ;