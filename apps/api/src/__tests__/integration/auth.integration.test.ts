import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";

vi.mock("stripe", () => ({ default: vi.fn(() => ({})) }));
vi.mock("../../queue/analysisQueue.js", () => ({
  redis: { on: vi.fn() },
  analysisQueue: { on: vi.fn() },
}));
vi.mock("../../queue/analysisWorker.js", () => ({}));
vi.mock("bcrypt", () => ({
  default: { compare: vi.fn(), hash: vi.fn() },
  compare: vi.fn(),
  hash: vi.fn(),
}));
vi.mock("jsonwebtoken", () => ({
  default: { sign: vi.fn(() => "mocked.jwt.token"), verify: vi.fn() },
  sign: vi.fn(() => "mocked.jwt.token"),
  verify: vi.fn(),
}));

const prismaMock = {
  user: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
};
vi.mock("../../db.js", () => ({ prisma: prismaMock }));

const { createApp } = await import("../../app.js");
const app = createApp();

describe("POST /auth/login", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 400 when password is missing", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ email: "test@test.com" });
    expect(res.status).toBe(400);
  });

  it("returns 401 when user does not exist", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    const res = await request(app)
      .post("/auth/login")
      .send({ email: "noone@test.com", password: "pass123" });
    expect(res.status).toBe(401);
  });

  it("returns 401 when password is wrong", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 1, email: "user@test.com", password: "hashed", banned: false, role: "USER",
    });
    const bcrypt = await import("bcrypt");
    (bcrypt.default.compare as any).mockResolvedValue(false);

    const res = await request(app)
      .post("/auth/login")
      .send({ email: "user@test.com", password: "wrongpass" });
    expect(res.status).toBe(401);
  });

  it("returns 200 and token when credentials are valid", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 1, email: "user@test.com", password: "hashed",
      banned: false, role: "USER", firstName: "Test", lastName: "User",
    });
    const bcrypt = await import("bcrypt");
    (bcrypt.default.compare as any).mockResolvedValue(true);

    const res = await request(app)
      .post("/auth/login")
      .send({ email: "user@test.com", password: "correctpass" });
    expect(res.status).toBe(200);
  });
});

describe("GET /auth/current-user", () => {
  it("returns 401 when no token is provided", async () => {
    const res = await request(app).get("/auth/current-user");
    expect(res.status).toBe(401);
  });
});
