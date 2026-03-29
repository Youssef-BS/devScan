import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import githubRoutes from "./routes/repo.routes.js";
import commitRoutes from "./routes/commit.routes.js";
import adminRoutes from "./routes/admin.route.js";
import userRoutes from "./routes/user.route.js" ;
import subscriptionRoutes from "./routes/subscription.routes.js";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
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

// Register subscription routes BEFORE express.json()
// Webhook route has raw() middleware, other routes have json() middleware
app.use("/subscription", subscriptionRoutes);

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


app.listen(process.env.PORT, () => {
  console.log(`API running on http://localhost:${process.env.PORT}`);
});
