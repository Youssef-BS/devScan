import { Router } from "express";
import { adminLogin } from "../controllers/AdminAuth.controller";

const router : Router = Router();
router.post("/login", adminLogin) ;

export default router ;