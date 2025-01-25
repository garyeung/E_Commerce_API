import { Router } from "express";
import PaymentController from "../controllers/payment.controller";
import { cartItemService, cartService } from "../services/cart.service";
import PaymentService from "../services/payment.service";
import { env } from "../config/env.config";
import { orderItemService, orderService } from "../services/order.service";
import { productService } from "../services/product.service";
import { userService } from "../services/user.service";

const stripeKey = env.STRIPE_SECRET_KEY;
const webhookKey = env.WEBHOOK_SECRET;


const rforCheckout = Router();
const rforWebhook = Router();
const paymentS = new PaymentService(stripeKey,webhookKey);

export async function checkoutRouter() {
    const cartS =  cartService;
    const orderS =  orderService;
    const orderItemS  =  orderItemService;


    const paymentController = new PaymentController(await cartS, paymentS,await orderS,await orderItemS, await cartItemService, await productService, await userService);

    rforCheckout.post("/", paymentController.checkout);

    return rforCheckout;
}

export async function webHookRouter() {
    const cartS =  cartService;
    const orderS =  orderService;
    const orderItemS  = orderItemService;

    const paymentController = new PaymentController(await cartS,paymentS,await orderS,await orderItemS, await cartItemService, await productService, await userService);

    rforWebhook.post("/", paymentController.handleOrder)

    return rforWebhook;
}