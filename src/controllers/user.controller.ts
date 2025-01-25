import UserService from "../services/user.service";
import {NextFunction, Request, Response} from 'express';
import tokenGenerator from "../services/token.service";
import { comparePassword, hashPassword } from "../services/hashing.service";
import { IUserLogin, IUserSignup } from "../models/interface/user.interface";
import CustomError from "../models/utils/customError";
import { IUserRes } from "../models/interface/user.interface";
import handleRequest from "../middlewares/requestHandler";

class UserController {
   private userService: UserService;

    constructor(service: UserService){
        this.userService = service;
        this.signup = this.signup.bind(this);
        this.login = this.login.bind(this);
    }


    async signup(req:Request, res:Response, next: NextFunction){
        await handleRequest<IUserRes>(req, res, next, async (req) => {
            const {email, name, password}:IUserSignup = req.body;

            const exsiting  = await this.userService.findOne({email});

            if(exsiting){
                throw new CustomError(400, 'The email alreadly exists');
            }

            const hashPW = await hashPassword(password);
            const user = await this.userService.create({email, name, password:hashPW});

            //console.log("Created user: ", user);

            const token = tokenGenerator(user);
            return {token};

        },201)

    }

    async login(req:Request, res:Response, next: NextFunction){ 
        await handleRequest<IUserRes>(req, res, next, async (req) => {

            const {email, password}:IUserLogin = req.body;
            const user  = await this.userService.findOne({email});

            if(!user){
                throw new CustomError(404, 'Invalid email');
            }

            const isMatch = await comparePassword(password, user.password);

            if(!isMatch){
                throw new CustomError(401, 'Invalid password');
            }

            const token = tokenGenerator(user);
            //console.log("Login user: ", user);

            return {token} 
        },200)
    };
    
    
}

export default UserController;