import { Request, Response } from 'express';
import { prisma } from '../db.js';
import bcrypt from 'bcrypt';
import { generateToken } from '../utils/jwt.js';
import { AuthRequest } from 'src/middleware/auth.js';
import { adminLoginSchema } from '@repo/validation';


export const adminLogin = async (req: Request, res: Response) => {
    try {
        const result = adminLoginSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                message: "Validation error",
                errors: result.error.flatten(),
            });
        }

        const { email, password } = result.data;

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user)
            return res.status(401).json({ message: "Invalid credentials" });

        if (user.role !== "ADMIN")
            return res.status(403).json({ message: "Access denied" });

        if (!user.password)
            return res.status(401).json({ message: "This user does not have a password." });

        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid)
            return res.status(401).json({ message: "Invalid credentials" });

        const token = generateToken({
            userId: user.id,
            role: user.role,
            isBanned: user.isBanned
        });

        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000
        });

        return res.json({ message: "Admin Login successful" });

    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

export const Logout = async (req: Request, res: Response) => {
    res.clearCookie("token");
    return res.json({message : "Logged out successfully"});
}

export const getCurrentAdmin = async (req: AuthRequest, res: Response) => {
    try {
          if(!req.user) {
            return res.status(401).json({message : "Not authenticated"});
         }

         if(req.user?.role !== "ADMIN") {
            return res.status(403).json({message : "Access denied"});
         }

         const admin = await prisma.user.findUnique({
            where : {
               id : req.user.userId ,
                
            } ,
            select : {
                email : true , 
                role : true
            }
         })

         if(!admin) {
            return res.status(404).json({message : "Admin not found"});
         }

         return res.json({admin}) ;


    }catch (error) {
                return res.status(500).json({ message: 'Internal Server Error' });
         }      
}