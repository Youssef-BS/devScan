import { Router } from "express";
import { adminLogin , getCurrentAdmin, Logout } from "../controllers/AdminAuth.controller";
import { isAdmin } from "src/middleware/isAdmin";
import { auth } from "src/middleware/auth";

const router : Router = Router();

router.post("/login", adminLogin) ;
router.get("/current", auth , isAdmin ,  getCurrentAdmin) ;
router.post("/logout", Logout) ;


export default router ;