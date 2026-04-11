import { Router } from "express";
import { handleGitHubWebhook } from "../controllers/Webhook.controller.js";

const router: Router = Router();

/**
 * POST /webhooks/github
 *
 * Receives push and pull_request events from GitHub.
 * Configure this URL in your repo's Settings → Webhooks.
 *
 * Set GITHUB_WEBHOOK_SECRET in .env to enable signature verification.
 */
router.post("/github", handleGitHubWebhook);

export default router;
