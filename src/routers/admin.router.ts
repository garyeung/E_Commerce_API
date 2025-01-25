import { Router } from "express";
import { userService } from "../services/user.service";
import AdminController from "../controllers/admin.controller";
import validateRequest from "../middlewares/requestValidation";
import { loginSchema } from "../models/schema/user.schema";

const router = Router();

async function adminRouter() {
    const service = await userService;
    const adminController = new AdminController(service);
    router.post('/login', validateRequest(loginSchema), adminController.login);

    return router;
}


export default adminRouter;