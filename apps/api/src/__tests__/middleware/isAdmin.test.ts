import { describe, it, expect, vi, beforeEach } from "vitest";
import { isAdmin } from "../../middleware/isAdmin.js";
import type { Response, NextFunction } from "express";
import type { AuthRequest } from "../../middleware/auth.js";

const mockRes = () => {
  const res = {} as Response;
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

const mockNext: NextFunction = vi.fn();

describe("isAdmin middleware", () => {
  beforeEach(() => vi.clearAllMocks());

  it("calls next() when user is ADMIN", () => {
    const req = { user: { userId: 1, role: "ADMIN" } } as unknown as AuthRequest;
    isAdmin(req, mockRes(), mockNext);
    expect(mockNext).toHaveBeenCalled();
  });

  it("returns 403 when user is not ADMIN", () => {
    const req = { user: { userId: 2, role: "USER" } } as unknown as AuthRequest;
    const res = mockRes();
    isAdmin(req, res, mockNext);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("returns 401 when user is not set", () => {
    const req = {} as unknown as AuthRequest;
    const res = mockRes();
    isAdmin(req, res, mockNext);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(mockNext).not.toHaveBeenCalled();
  });
});
