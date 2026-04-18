import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import * as jwtModule from "../../utils/jwt-verify.js";

vi.mock("stripe", () => ({ default: vi.fn(() => ({})) }));
vi.mock("../../queue/analysisQueue.js", () => ({
  redis: { on: vi.fn() },
  analysisQueue: { on: vi.fn() },
}));
vi.mock("../../queue/analysisWorker.js", () => ({}));
vi.mock("axios");

const prismaMock = {
  user: { findUnique: vi.fn() },
  repo: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    count: vi.fn(),
    create: vi.fn(),
    deleteMany: vi.fn(),
  },
};
vi.mock("../../db.js", () => ({ prisma: prismaMock }));

const { createApp } = await import("../../app.js");
const app = createApp();

function mockValidJWT() {
  vi.spyOn(jwtModule, "verifyJWT").mockReturnValue({
    id: 1, userId: 1, email: "user@test.com", role: "USER",
  });
}

describe("GET /github/repos/all-db", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 without token", async () => {
    const res = await request(app).get("/github/repos/all-db");
    expect(res.status).toBe(401);
  });

  it("returns paginated repos for authenticated user", async () => {
    mockValidJWT();
    prismaMock.repo.findMany.mockResolvedValue([
      { id: 1, name: "my-repo", fullName: "user/my-repo", language: "TypeScript" },
    ]);
    prismaMock.repo.count.mockResolvedValue(1);

    const res = await request(app)
      .get("/github/repos/all-db")
      .set("Cookie", "token=valid.jwt.token");

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.pagination.total).toBe(1);
  });
});

describe("POST /github/repos/save", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 without token", async () => {
    const res = await request(app).post("/github/repos/save").send({});
    expect(res.status).toBe(401);
  });

  it("returns 400 when repo already exists", async () => {
    mockValidJWT();
    prismaMock.repo.findUnique.mockResolvedValue({ id: 1 });

    const res = await request(app)
      .post("/github/repos/save")
      .set("Cookie", "token=valid.jwt.token")
      .send({ githubId: "123", name: "repo", fullName: "user/repo" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Repository already saved");
  });

  it("returns 201 when repo is created successfully", async () => {
    mockValidJWT();
    prismaMock.repo.findUnique.mockResolvedValue(null);
    prismaMock.repo.create.mockResolvedValue({
      id: 1, githubId: "123", name: "repo", fullName: "user/repo",
    });

    const res = await request(app)
      .post("/github/repos/save")
      .set("Cookie", "token=valid.jwt.token")
      .send({ githubId: "123", name: "repo", fullName: "user/repo", private: false, fork: false });

    expect(res.status).toBe(201);
    expect(res.body.repo).toBeDefined();
  });
});

describe("DELETE /github/repos/clear", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 without token", async () => {
    const res = await request(app).delete("/github/repos/clear");
    expect(res.status).toBe(401);
  });

  it("deletes all user repos and returns success", async () => {
    mockValidJWT();
    prismaMock.repo.deleteMany.mockResolvedValue({ count: 3 });

    const res = await request(app)
      .delete("/github/repos/clear")
      .set("Cookie", "token=valid.jwt.token");

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("All repositories deleted successfully");
  });
});
