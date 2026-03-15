import { Response , NextFunction } from "express";
import { AuthRequest } from "./auth";

export const isBanned = (req : AuthRequest , res : Response , next : NextFunction) => {
    if(!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
    }
    if(req.user.isBanned) {
        return res.status(403).json({ message: 'Access denied. User is banned.' });
    }
    next();
}