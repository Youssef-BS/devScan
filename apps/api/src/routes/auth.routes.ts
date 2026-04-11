import { Router } from "express";
import {  githubLogin , githubCallback , logout , getCurrentUser, updateProfile, changePassword, updateName , LoginUserWithEmail } from "../controllers/Auth.controller.js";
import { auth } from "../middleware/auth.js"
import { isBanned } from "../middleware/isBanned.js";

const router:Router = Router();

router.get("/github" , githubLogin);
router.get("/github/callback"  , githubCallback);
router.post("/login", LoginUserWithEmail);

router.get("/current-user", auth, isBanned, getCurrentUser);
router.post("/update-profile",auth , updateProfile);
router.patch("/change-password", auth, changePassword);
router.patch("/update-name", auth , updateName);
router.post("/logout", auth , logout);


export default router; 