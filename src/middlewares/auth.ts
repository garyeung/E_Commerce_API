import { Request, Response, NextFunction, response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.config';
import { JwtPayload } from '../models/interface/jwtPayload.interface';

const SECRET = env.SECRET;

async function auth(req: Request, res: Response, next: NextFunction) {
    const token = req.header('Authorization')?.split(' ')[1];

    if(!token) {
        res.status(401).json({message: 'Unauthorized'});
        return;
    }

    try {
        const decoded = jwt.verify(token, SECRET) as JwtPayload;
        req.user = decoded;

        next();
        
    } catch (error) {
        console.error("Error verifying token", error);

        response.status(401).json({message: 'Unauthorized'});
        return;
        
    }
}

export default auth;