import { Router } from "express";
import { getListUsers , getUserDetails, updateUser , banUser , unbanUser } from "../controllers/User.controller";
import { isAdmin } from "src/middleware/isAdmin";
import { auth } from "src/middleware/auth";

const router : Router = Router() ;

router.get('/',  getListUsers) ;
router.get('/:id'  , getUserDetails) ;
router.put("/:id", updateUser);
router.patch("/:id/ban", banUser);
router.patch("/:id/unban", unbanUser);

export default router ;