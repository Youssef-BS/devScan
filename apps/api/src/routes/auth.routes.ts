import { Router } from "express";
import {  githubLogin , githubCallback , logout , getCurrentUser } from "../controllers/Auth.controller.js";

const router:Router = Router();

router.get("/github", githubLogin);
router.get("/github/callback", githubCallback);
router.get("/current-user", getCurrentUser);
router.post("/logout", logout);


export default router; 