import { describe, it, expect, vi } from "vitest";
import request from "supertest";

vi.mock("stripe", () => ({ default: vi.fn(() => ({})) }));
vi.mock("../../db.js", () => ({ prisma: {} }));
vi.mock("../../queue/analysisQueue.js", () => ({
  redis: { on: vi.fn() },
  analysisQueue: { on: vi.fn() },
}));
vi.mock("../../queue/analysisWorker.js", () => ({}));

const { createApp } = await import("../../app.js");
const app = createApp();

describe("GET /health", () => {
  it("returns 200 with status message", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: "API Service is running" });
  });
});
