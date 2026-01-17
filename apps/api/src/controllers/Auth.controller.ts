import { Request, Response } from 'express';

export const login = async (req : Request , res:Response ) =>  {
try {
   res.json({message: 'Login successful' });
}catch(error){
    res.status(500).json({message: 'Internal Server Error' });
}
}