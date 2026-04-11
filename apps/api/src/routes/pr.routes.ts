import { Router } from "express";
import { listPullRequests, getFileContent, applyFix } from "../controllers/PR.controller.js";
import { auth } from "../middleware/auth.js";
import { isBanned } from "../middleware/isBanned.js";

const router: Router = Router();

/**
 * Mounted at /github/repos — routes include :githubId explicitly
 *
 * GET  /github/repos/:githubId/pulls           → list open/closed PRs
 * GET  /github/repos/:githubId/file?path=...   → fetch file content from GitHub
 * POST /github/repos/:githubId/apply-fix       → push fix directly or create PR
 */

router.get("/:githubId/pulls",      auth, isBanned, listPullRequests);
router.get("/:githubId/file",       auth, isBanned, getFileContent);
router.post("/:githubId/apply-fix", auth, isBanned, applyFix);

export default router;
