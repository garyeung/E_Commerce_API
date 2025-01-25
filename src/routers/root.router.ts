import { Router } from "express";
import userRouter from "./user.router";
import cartRouter from "./cart.router";
import auth from "../middlewares/auth";
import adminRouter from "./admin.router";
import {productRouter, productForAdminRouter} from "./product.router";
import {checkoutRouter, webHookRouter} from "./payment.router";

const rootRouter = Router();

async function initalizeRootRouter() {

    rootRouter.use("/products", await productRouter());
    rootRouter.use('/webhook', await webHookRouter());


    // user endpoint
    const userMainRouter = Router();
    userMainRouter.use("/user", await userRouter());
    userMainRouter.use("/user/cart", auth, await cartRouter());
    userMainRouter.use('/user/checkout', auth, await checkoutRouter());
    rootRouter.use(userMainRouter);


    // admin endpoint
    const adminMainRouter = Router();

    adminMainRouter.use("/admin", await adminRouter());
    adminMainRouter.use("/admin/products", auth, await productForAdminRouter());
    rootRouter.use(adminMainRouter);

    return rootRouter;
}

export default initalizeRootRouter;
