import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;

export interface DecodedToken {
  id: number;
  email: string;
  userId?: number;
  role?: "USER" | "ADMIN";
}

export function verifyJWT(token: string): DecodedToken {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
    return decoded;
  } catch (err) {
    throw new Error("Invalid or expired token");
  }
}
