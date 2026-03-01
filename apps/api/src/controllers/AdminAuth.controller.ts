import { Request, Response } from 'express';
import { prisma } from '../db';
import bcrypt from 'bcrypt';
import { generateToken } from '../utils/jwt';


export const adminLogin = async (req: Request, res: Response) => {
    const {email , password} = req.body ; 
   
    try {

        if(!email || !password) {
            return res.status(400).json({message : "Email and password are required"});
        }

        const user = await prisma.user.findUnique({
            where : {
                email
            }
        })

        if(!user)
            return res.status(401).json({message : "Invalid credentials"});

        if(user.role !== "ADMIN") 
            return res.status(403).json({message : "Access denied"});

        if(!user.password) 
            return res.status(401).json({message : "This user does not have a password."});

        const isValid = await bcrypt.compare(password , user.password) ;

        if(!isValid)
            return res.status(401).json({message : "Invalid credentials"});

        const token = generateToken({
            userId : user.id ,
            role : user.role
        })

        return res.json({
            message : "Login successful",
            token
        })


   } catch (error) {
     return res.status(500).json({ message: 'Internal Server Error' });
   }
}