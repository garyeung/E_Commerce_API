import handleRequest from "../middlewares/requestHandler";
import { UserRole } from "../models/entity/User.entity";
import { IUserLogin, IUserRes } from "../models/interface/user.interface";
import CustomError from "../models/utils/customError";
import { comparePassword } from "../services/hashing.service";
import tokenGenerator from "../services/token.service";
import UserService from "../services/user.service";
import { NextFunction, Request, Response } from 'express';

class AdminController {
    private userService: UserService;

    constructor(service: UserService){
        this.userService = service;
        this.login = this.login.bind(this);
    }

    async login(req:Request, res:Response, next: NextFunction){ 
        await handleRequest<IUserRes>(req, res, next, async (req) => {
        const {email, password}:IUserLogin = req.body;
        const user  = await this.userService.findOne({email});

        if(!user){
            throw new CustomError(404, 'Invalid email');
        }

        if(user.role !== UserRole.ADMIN){
            throw new CustomError(401, 'Unauthorized');
        }

        const isMatch = await comparePassword(password, user.password);

        if(!isMatch){
            throw new CustomError(401, 'Invalid password');
        }

        const token = tokenGenerator(user);
        return {token};

        }, 200);
    }
    
}

export default AdminController; 