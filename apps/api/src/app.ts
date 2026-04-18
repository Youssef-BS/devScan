import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import githubRoutes from "./routes/repo.routes.js";
import commitRoutes from "./routes/commit.routes.js";
import adminRoutes from "./routes/admin.route.js";
import userRoutes from "./routes/user.route.js";
import subscriptionRoutes from "./routes/subscription.routes.js";
import collaborationRoutes from "./routes/collaboration.routes.js";
import webhookRoutes from "./routes/webhook.routes.js";
import prRoutes from "./routes/pr.routes.js";

export function createApp() {
  const app = express();

  app.use(cookieParser());

  app.use(
    cors({
      origin: (origin, callback) => {
        const allowedOrigins = [
          process.env.CORS_ORIGIN || "http://localhost:3000",
          "http://localhost:3001",
          "http://localhost:3000",
        ];
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      credentials: true,
    }),
  );

  app.use(
    express.json({
      verify: (req: any, _res, buf) => {
        req.rawBody = buf;
      },
    }),
  );

  app.get("/health", (_req, res) => {
    res.json({ message: "API Service is running" });
  });

  app.use("/auth", authRoutes);
  app.use("/github/repos", githubRoutes);
  app.use("/github/commit", commitRoutes);
  app.use("/admin", adminRoutes);
  app.use("/users", userRoutes);
  app.use("/collaboration", collaborationRoutes);
  app.use("/subscription", subscriptionRoutes);
  app.use("/webhooks", webhookRoutes);
  app.use("/github/repos", prRoutes);

  return app;
}
