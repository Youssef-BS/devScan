import { Router } from "express";
import { adminLogin , getCurrentAdmin, Logout } from "../controllers/AdminAuth.controller";
import { 
  getSubscriptionStats, 
  getSubscriptionBreakdown, 
  getSubscriptionChartData,
  getRecentSubscriptions 
} from "../controllers/AdminSubscription.controller";
import {
  getAllSettings,
  getSetting,
  updateSetting,
  getSystemHealth,
  getSystemStats,
} from "../controllers/AdminSettings.controller";
import { isAdmin } from "src/middleware/isAdmin";
import { auth } from "src/middleware/auth";
import { isBanned } from "src/middleware/isBanned";

const router : Router = Router();

router.post("/login"  , adminLogin) ;
router.get("/current", auth , isAdmin , isBanned , getCurrentAdmin) ;
router.post("/logout", auth , isAdmin , isBanned , Logout) ;

// Admin Subscription Stats Routes
router.get("/subscriptions/stats", auth, isAdmin, isBanned, getSubscriptionStats);
router.get("/subscriptions/breakdown", auth, isAdmin, isBanned, getSubscriptionBreakdown);
router.get("/subscriptions/chart", auth, isAdmin, isBanned, getSubscriptionChartData);
router.get("/subscriptions/recent", auth, isAdmin, isBanned, getRecentSubscriptions);

// Admin Settings Routes
router.get("/settings", auth, isAdmin, isBanned, getAllSettings);
router.get("/settings/:key", auth, isAdmin, isBanned, getSetting);
router.put("/settings/:key", auth, isAdmin, isBanned, updateSetting);

// Admin System Routes
router.get("/system/health", auth, isAdmin, isBanned, getSystemHealth);
router.get("/system/stats", auth, isAdmin, isBanned, getSystemStats);

export default router ;