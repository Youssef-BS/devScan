import { Router , Request ,   Response } from "express";
// import { login } from "../controllers/Auth.controller.js";

const router:Router = Router();

router.get('/login', (req: Request, res: Response) => {
  res.json({ message: 'Login successful (GET)' });
});


export default router; 