import { env } from "../config/env.config";
import jwt from 'jsonwebtoken';
import { JwtPayload } from "../models/interface/jwtPayload.interface";

function tokenGenerator(user:{
    id: number,
    email: string,
}) {

    const payload:JwtPayload = {
        id: user.id,
        email: user.email,
    }

  return jwt.sign(payload, env.SECRET, { expiresIn: '1h' });
}

export default tokenGenerator;