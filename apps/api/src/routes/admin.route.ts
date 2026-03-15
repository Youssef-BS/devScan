import { Router } from "express";
import { adminLogin , getCurrentAdmin, Logout } from "../controllers/AdminAuth.controller";
import { isAdmin } from "src/middleware/isAdmin";
import { auth } from "src/middleware/auth";
import { isBanned } from "src/middleware/isBanned";

const router : Router = Router();

router.post("/login"  , adminLogin) ;
router.get("/current", auth , isAdmin , isBanned , getCurrentAdmin) ;
router.post("/logout", auth , isAdmin , isBanned , Logout) ;


export default router ;