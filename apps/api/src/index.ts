import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import githubRoutes from "./routes/repo.routes.js";
import commitRoutes from "./routes/commit.routes.js";
import adminRoutes from "./routes/admin.route.js";
import userRoutes from "./routes/user.route.js" ;
import session from "express-session";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
app.use(cookieParser()) ;


app.use(session({
  name: 'sessionId',
  secret: process.env.SESSION_SECRET || 'defaultsecret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000 
  }
})) ;

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


app.listen(process.env.PORT, () => {
  console.log(`API running on http://localhost:${process.env.PORT}`);
});
