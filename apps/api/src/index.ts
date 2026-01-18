import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import session from "express-session";

dotenv.config();

const app = express();

app.use(session({
  name: 'sessionId',
  secret: process.env.SESSION_SECRET || 'defaultsecret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    // set a reasonable max age for dev and production
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  }

}))

app.use(cors(
  {
    origin : process.env.CORS_ORIGIN,
    credentials: true,
  }
));
app.use(express.json());


//test route
app.get("/health", (req, res) => {
  res.json({ messgae: "API Service is running" });
});


app.use("/auth", authRoutes);

app.listen(process.env.PORT, () => {
  console.log(`API running on http://localhost:${process.env.PORT}`);
});
