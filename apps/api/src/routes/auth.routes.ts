import { Router } from "express";
import {  githubLogin , githubCallback , logout , getCurrentUser, updateProfile, changePassword, updateName } from "../controllers/Auth.controller.js";
import { auth } from "../middleware/auth.js"
import { isBanned } from "src/middleware/isBanned.js";

const router:Router = Router();

router.get("/github" , githubLogin);
router.get("/github/callback"  , githubCallback);

router.get("/current-user", auth, getCurrentUser);
router.post("/update-profile",auth , updateProfile);
router.patch("/change-password", auth, changePassword);
router.patch("/update-name", auth , updateName);
router.post("/logout", auth , logout);


export default router; 