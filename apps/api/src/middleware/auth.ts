import { Request, Response, NextFunction } from "express";
import { verifyJWT } from "../utils/jwt-verify.js";

export interface AuthRequest extends Request {
  user?: {
    userId: number;
    role: "USER" | "ADMIN";
    isBanned?: boolean;
  };
}

export const auth = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.token; 

    if (!token) {
      return res.status(401).json({ message: "Missing token" });
    }

    const decoded = verifyJWT(token);
    console.log("Decoded JWT:", decoded);
    req.user = { userId: decoded.id || decoded.userId || 0, role: decoded.role || "USER" };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};