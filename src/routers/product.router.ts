import { Router } from "express";
import { productService } from "../services/product.service";
import ProductController from "../controllers/product.controller";
import requestValidation from "../middlewares/requestValidation";
import { productSchema } from "../models/schema/product.schema";

const rforUser = Router();
const rforAdmin = Router();

export async function productRouter() {
    const service = productService;
    const productController = new ProductController(await service);
    rforUser.get('/', productController.getAllProducts);
    rforUser.get('/:id', productController.getProduct)

    return rforUser;
        
}

export async function productForAdminRouter() {
    const service =  productService;
    const productController = new ProductController(await service);
    rforAdmin.get('/', productController.getAllProducts);
    rforAdmin.get('/:id', productController.getProduct)
    rforAdmin.post('/add', requestValidation(productSchema), productController.createProduct);
    rforAdmin.put('/update/:id', requestValidation(productSchema), productController.updtateProduct);
    rforAdmin.delete('/remove/:id', productController.removeProduct);

    return rforAdmin;
}