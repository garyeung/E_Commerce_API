import bcrypt from 'bcrypt';
import { env } from '../config/env.config';
const SALT_ROUNDS = env.SALT_ROUNDS;

export async function hashPassword(password: string){
    return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(password: string, hash: string){
    return bcrypt.compare(password, hash);
}