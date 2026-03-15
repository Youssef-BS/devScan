import { Router } from "express";
import {  githubLogin , githubCallback , logout , getCurrentUser, updateProfile } from "../controllers/Auth.controller.js";
import { auth } from "../middleware/auth.js"

const router:Router = Router();

router.get("/github", githubLogin);
router.get("/github/callback", githubCallback);

router.get("/current-user", auth, getCurrentUser);
router.post("/update-profile",auth , updateProfile);
router.post("/logout", logout);


export default router; 