import { Router } from "express";
import { cartItemService, cartService } from "../services/cart.service";
import { productService } from "../services/product.service";
import CartController from "../controllers/cart.controller";
import validateRequest from "../middlewares/requestValidation";
import { addCartItemScheme, deleteCartItemScheme, updateCartItemScheme } from "../models/schema/cart.schema";

const r = Router();

async function cartRouter() {
    const cartS =  cartService;
    const cartItemS =  cartItemService;
    const productS =  productService;
    const cartController = new CartController(await cartS, await cartItemS, await productS);

    r.post('/add', validateRequest(addCartItemScheme), cartController.addCartItem);
    r.delete('/delete', validateRequest(deleteCartItemScheme), cartController.deleteCartItem);
    r.get('/all', cartController.getCart);
    r.put('/update', validateRequest(updateCartItemScheme), cartController.updateCartItem);

    return r;
    
}

export default cartRouter;

