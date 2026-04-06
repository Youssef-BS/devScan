import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import authRoutes from "./routes/auth.routes.js";
import githubRoutes from "./routes/repo.routes.js";
import commitRoutes from "./routes/commit.routes.js";
import adminRoutes from "./routes/admin.route.js";
import userRoutes from "./routes/user.route.js" ;
import subscriptionRoutes from "./routes/subscription.routes.js";
import collaborationRoutes from "./routes/collaboration.routes.js";
import cookieParser from "cookie-parser";
import { initializeSocket } from "./utils/socket.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);

const io = initializeSocket(httpServer);

app.use(cookieParser()) ;

app.use(cors(
  {
    origin : (origin, callback) => {
      const allowedOrigins = [
        process.env.CORS_ORIGIN || 'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3000'
      ];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  }
));



app.use(express.json());

//test route
app.get("/health", (req, res) => {
  res.json({ messgae: "API Service is running" });
});


app.use("/auth", authRoutes);
app.use("/github/repos", githubRoutes);
app.use("/github/commit" , commitRoutes); 
app.use("/admin" , adminRoutes) ;
app.use("/users" ,  userRoutes) ;
app.use("/collaboration", collaborationRoutes);
app.use("/subscription", subscriptionRoutes);

const PORT = parseInt(process.env.PORT || "4000", 10);

httpServer.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
