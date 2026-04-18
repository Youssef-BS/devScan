import { describe, it, expect, vi, beforeEach } from "vitest";
import { isBanned } from "../../middleware/isBanned.js";
import type { Response, NextFunction } from "express";
import type { AuthRequest } from "../../middleware/auth.js";

const mockRes = () => {
  const res = {} as Response;
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

const mockNext: NextFunction = vi.fn();

describe("isBanned middleware", () => {
  beforeEach(() => vi.clearAllMocks());

  it("calls next() when user is not banned", () => {
    const req = { user: { userId: 1, role: "USER", isBanned: false } } as unknown as AuthRequest;
    isBanned(req, mockRes(), mockNext);
    expect(mockNext).toHaveBeenCalled();
  });

  it("returns 403 when user is banned", () => {
    const req = { user: { userId: 2, role: "USER", isBanned: true } } as unknown as AuthRequest;
    const res = mockRes();
    isBanned(req, res, mockNext);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: "Access denied. User is banned." });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("returns 401 when user is not set", () => {
    const req = {} as unknown as AuthRequest;
    const res = mockRes();
    isBanned(req, res, mockNext);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(mockNext).not.toHaveBeenCalled();
  });
});
