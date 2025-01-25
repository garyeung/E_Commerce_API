import {Router} from 'express'
import UserController from '../controllers/user.controller';
import { userService } from '../services/user.service';
import requestValidation from '../middlewares/requestValidation';
import { loginSchema, signupSchema } from '../models/schema/user.schema';


const r = Router();
async function userRouter() {
    const service = await userService;
    const userController = new UserController(service);
    r.post('/login',requestValidation(loginSchema), userController.login);
    r.post('/signup',requestValidation(signupSchema), userController.signup);

    return r;
    
}





export default userRouter;