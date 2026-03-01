import { Response , NextFunction } from "express";
import { AuthRequest } from "./auth";

export const isAdmin = (req : AuthRequest , res : Response , next : NextFunction) => {
    try { 

        if(req.user?.role === "ADMIN")
            return res.status(403).json({message : "Forbidden: Admins only"}) ;
        next() ;

    }catch(error : any) {
       return res.status(500).json({ message: 'Internal Server Error' });
    }
}