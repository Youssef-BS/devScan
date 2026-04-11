import { Queue } from "bullmq";
import IORedis from "ioredis";

// Shared Redis connection (maxRetriesPerRequest: null required by BullMQ)
export const redis = new IORedis({
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null,
});

redis.on("error", (err) => {
  console.error("[Redis] Connection error:", err.message);
});

redis.on("connect", () => {
  console.log("[Redis] Connected");
});

// ─── Queue definition ─────────────────────────────────────────────────────

export const analysisQueue = new Queue("code-analysis", {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 5_000 },
    removeOnComplete: 100,   // keep last 100 completed jobs
    removeOnFail:     50,    // keep last 50 failed jobs
  },
});

export interface AnalysisJobData {
  sha:          string;
  repoId:       number;
  repoFullName: string;
  accessToken:  string;
  analysisType?: string;
}
