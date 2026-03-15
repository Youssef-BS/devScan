import { Router } from "express";
import { getListUsers , getUserDetails, updateUser , banUser , unbanUser } from "../controllers/User.controller";
import { isAdmin } from "src/middleware/isAdmin";
import { auth } from "src/middleware/auth";
import { isBanned } from "src/middleware/isBanned";

const router : Router = Router() ;

router.get('/', auth , isAdmin , isBanned ,getListUsers) ;
router.get('/:id'  , auth , isBanned , getUserDetails) ;
router.put("/:id", auth , isAdmin , isBanned , updateUser);
router.patch("/:id/ban", auth , isAdmin , isBanned , banUser);
router.patch("/:id/unban", auth , isAdmin , isBanned , unbanUser);

export default router ;