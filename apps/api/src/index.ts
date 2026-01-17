import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";

dotenv.config();

const app = express();

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


app.use("/api/auth", authRoutes);


app.listen(process.env.PORT, () => {
  console.log(`API running on http://localhost:${process.env.PORT}`);
});
