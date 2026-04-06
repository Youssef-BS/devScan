import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.js";
import { prisma } from "../db.js";

export const requireActiveSubscription = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        subscriptionStatus: true,
        subscriptionEndDate: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.subscriptionStatus !== "ACTIVE") {
      return res.status(403).json({
        message: "Subscription required",
        subscriptionStatus: user.subscriptionStatus,
      });
    }

    if (user.subscriptionEndDate && new Date() > user.subscriptionEndDate) {
      await prisma.user.update({
        where: { id: req.user.userId },
        data: { subscriptionStatus: "EXPIRED" },
      });

      return res.status(403).json({
        message: "Subscription expired",
        subscriptionStatus: "EXPIRED",
      });
    }

    next();
  } catch (error) {
    console.error("Subscription check error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
