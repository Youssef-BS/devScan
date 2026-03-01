import { Router } from "express";
import { adminLogin , Logout } from "../controllers/AdminAuth.controller";

const router : Router = Router();
router.post("/login", adminLogin) ;
router.post("/logout", Logout) ;

export default router ;