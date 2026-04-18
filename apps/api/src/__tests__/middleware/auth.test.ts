import { describe, it, expect, vi, beforeEach } from "vitest";
import { auth } from "../../middleware/auth.js";
import * as jwtModule from "../../utils/jwt-verify.js";
import type { Response, NextFunction } from "express";
import type { AuthRequest } from "../../middleware/auth.js";

const mockRes = () => {
  const res = {} as Response;
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

const mockNext: NextFunction = vi.fn();

describe("auth middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls next() and sets req.user when token is valid", () => {
    const req = { cookies: { token: "valid.token" } } as unknown as AuthRequest;
    const res = mockRes();

    vi.spyOn(jwtModule, "verifyJWT").mockReturnValue({
      id: 1,
      email: "test@test.com",
      role: "USER",
    });

    auth(req, res, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(req.user).toEqual({ userId: 1, role: "USER" });
  });

  it("returns 401 when token is missing", () => {
    const req = { cookies: {} } as unknown as AuthRequest;
    const res = mockRes();

    auth(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Missing token" });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("returns 401 when token is invalid", () => {
    const req = { cookies: { token: "bad.token" } } as unknown as AuthRequest;
    const res = mockRes();

    vi.spyOn(jwtModule, "verifyJWT").mockImplementation(() => {
      throw new Error("Invalid token");
    });

    auth(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid or expired token" });
    expect(mockNext).not.toHaveBeenCalled();
  });
});
