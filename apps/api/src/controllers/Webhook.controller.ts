import crypto from "crypto";
import { Request, Response } from "express";
import { prisma } from "../db.js";
import { analysisQueue } from "../queue/analysisQueue.js";

// ─── Signature verification ───────────────────────────────────────────────

function verifyGitHubSignature(rawBody: Buffer, signature: string, secret: string): boolean {
  const expected = `sha256=${crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex")}`;
  try {
    return (
      signature.length === expected.length &&
      crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
    );
  } catch {
    return false;
  }
}

// ─── Main handler ─────────────────────────────────────────────────────────

export const handleGitHubWebhook = async (req: Request, res: Response) => {
  const secret    = process.env.GITHUB_WEBHOOK_SECRET;
  const signature = req.headers["x-hub-signature-256"] as string | undefined;
  const event     = req.headers["x-github-event"]       as string | undefined;

  // rawBody is attached by the express.json verify callback in index.ts
  const rawBody: Buffer = (req as any).rawBody ?? Buffer.from(JSON.stringify(req.body));

  // Verify HMAC signature when secret is configured
  if (secret) {
    if (!signature || !verifyGitHubSignature(rawBody, signature, secret)) {
      return res.status(401).json({ message: "Invalid webhook signature" });
    }
  }

  // Respond immediately — GitHub requires a fast 2xx to avoid retries
  res.status(200).json({ received: true, event });

  // Process asynchronously after response is sent
  try {
    if (event === "push") {
      await handlePushEvent(req.body);
    } else if (
      event === "pull_request" &&
      ["opened", "synchronize", "reopened"].includes(req.body?.action)
    ) {
      await handlePullRequestEvent(req.body);
    }
  } catch (err: any) {
    console.error(`[Webhook] Error handling "${event}" event:`, err.message);
  }
};

// ─── Push event ───────────────────────────────────────────────────────────

async function handlePushEvent(payload: any) {
  const repoGithubId = String(payload.repository?.id ?? "");
  const commits: any[] = payload.commits ?? [];

  if (!repoGithubId || commits.length === 0) return;

  const repo = await prisma.repo.findUnique({
    where:   { githubId: repoGithubId },
    include: { User: { select: { accessToken: true } } },
  });

  if (!repo) {
    console.warn(`[Webhook] Push: repo ${repoGithubId} not found in DB`);
    return;
  }

  if (!repo.autoAudit) {
    console.log(`[Webhook] Push: autoAudit disabled for repo ${repoGithubId}`);
    return;
  }

  const accessToken = repo.User?.accessToken;
  if (!accessToken) {
    console.warn(`[Webhook] Push: no access token for repo ${repoGithubId}`);
    return;
  }

  for (const commit of commits) {
    const sha: string = commit.id;

    // Persist commit so the worker can look it up
    await prisma.commit.upsert({
      where:  { sha },
      update: {},
      create: {
        sha,
        message: (commit.message as string).substring(0, 500),
        author:  commit.author?.name ?? "Unknown",
        date:    new Date(commit.timestamp),
        repoId:  repo.id,
      },
    });

    // Enqueue analysis (jobId ensures at-most-once per commit)
    await analysisQueue.add(
      "analyze",
      { sha, repoId: repo.id, repoFullName: repo.fullName, accessToken, analysisType: "commit" },
      { jobId: `commit-${sha}` },
    );

    console.log(`[Webhook] Queued commit ${sha} (push → ${repo.fullName})`);
  }
}

// ─── Pull-request event ───────────────────────────────────────────────────

async function handlePullRequestEvent(payload: any) {
  const repoGithubId = String(payload.repository?.id ?? "");
  const pr           = payload.pull_request;

  if (!repoGithubId || !pr) return;

  const repo = await prisma.repo.findUnique({
    where:   { githubId: repoGithubId },
    include: { User: { select: { accessToken: true } } },
  });

  if (!repo) {
    console.warn(`[Webhook] PR: repo ${repoGithubId} not found in DB`);
    return;
  }

  if (!repo.autoAudit) {
    console.log(`[Webhook] PR: autoAudit disabled for repo ${repoGithubId}`);
    return;
  }

  const accessToken = repo.User?.accessToken;
  if (!accessToken) {
    console.warn(`[Webhook] PR: no access token for repo ${repoGithubId}`);
    return;
  }

  const headSha: string = pr.head?.sha;
  if (!headSha) return;

  // Persist PR head commit
  await prisma.commit.upsert({
    where:  { sha: headSha },
    update: {},
    create: {
      sha:     headSha,
      message: `PR #${pr.number}: ${(pr.title as string).substring(0, 480)}`,
      author:  pr.user?.login ?? "Unknown",
      date:    new Date(pr.updated_at ?? Date.now()),
      repoId:  repo.id,
    },
  });

  // Enqueue analysis — unique per PR + head SHA
  await analysisQueue.add(
    "analyze",
    { sha: headSha, repoId: repo.id, repoFullName: repo.fullName, accessToken, analysisType: "audit" },
    { jobId: `pr-${pr.id}-${headSha}` },
  );

  console.log(`[Webhook] Queued PR #${pr.number} head ${headSha} (${repo.fullName})`);
}
