import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;

export interface AuthRequest extends Request {
  user?: {
    userId: number;
    role: "USER" | "ADMIN";
  };
}

export const auth = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.token; 

    if (!token) {
      return res.status(401).json({ message: "Missing token" });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; role: "USER" | "ADMIN" };
     console.log("Decoded JWT:", decoded)
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};