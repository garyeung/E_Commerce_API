import { IProduct, IProductRes } from "../models/interface/product.interface";
import { NextFunction, Request, Response } from "express";
import ProductService from "../services/product.service";
import CustomError from "../models/utils/customError";
import handleRequest from "../middlewares/requestHandler";
import { Product } from "../models/entity/Product.entity";

class ProductController {
    private productService: ProductService;

    constructor(service: ProductService){
        this.productService = service;
        this.createProduct = this.createProduct.bind(this);
        this.getAllProducts = this.getAllProducts.bind(this);
        this.getProduct = this.getProduct.bind(this);
        this.updtateProduct = this.updtateProduct.bind(this);
        this.removeProduct = this.removeProduct.bind(this);
        this.buildProductRes = this.buildProductRes.bind(this);
    }

    async createProduct(req:Request, res:Response, next: NextFunction){
        await handleRequest(req,res,next, async (req) => {
        const product:IProduct  = req.body; 

        const createdProduct = await this.productService.create(product);
        const result = this.buildProductRes(createdProduct);

        return result;

        }, 201)
    }

    async updtateProduct(req:Request, res:Response, next:NextFunction){
        await handleRequest(req, res, next, async (req) => {
        let {id} = req.params;
        const productId = parseInt(id);
        const product:IProduct  = req.body; 

        const existingProduct = await this.productService.findOne({id: productId});

        if(!existingProduct){
            throw new CustomError(404, 'Product not found');

        }
        const toUpdateProdcut = {...existingProduct, ...product};
        const updatedProduct = await this.productService.update({id:productId},toUpdateProdcut);
        if(!updatedProduct){
            throw new CustomError(500, "Error updating product internally")
        }
        const result = this.buildProductRes(updatedProduct);

        return result;

        }, 200);
    }

    async getProduct(req: Request, res:Response, next: NextFunction){
        await handleRequest(req, res, next, async (req) => {
        let {id} = req.params; 
        const existing = await this.productService.findOne({id: parseInt(id)});
        if(!existing){
            throw new CustomError(404, 'Product not found');
        }

        const result = this.buildProductRes(existing);

        return result

        }, 200);
    }

    async getAllProducts(req: Request, res:Response, next:NextFunction){
        await handleRequest(req, res, next, async (req) => {
        const {search} = req.query;
        const products = await this.productService.findAll({});
        let result: IProductRes[] = products.map(p => {
            return this.buildProductRes(p);
        });
        if(search){
            result = result.filter(p => (
                p.name.includes(search as string) 
             || p.description.includes(search as string)
             || p.category.includes(search as string)
            )
            );
        }

        return result

        }, 200)

    }

    async removeProduct(req: Request, res: Response, next: NextFunction) {
       await handleRequest(req, res, next, async (req) => {
       const {id} = req.params; 
       const productId = parseInt(id);
       const existing = await this.productService.findOne({id: productId});
       if(!existing){
           throw new CustomError(404, 'Product not found');
       }
        await this.productService.remove({id: productId});
        return {message: 'Product removed successfully'}

       },200)

    }

    private buildProductRes(product: Product):IProductRes{
        return {
            id: product.id,
            name: product.name,
            description: product.description,
            category: product.category,
            imageURLs: product.imageURLs,
            price: product.price,
            stock: product.stock,
            is_active: product.is_active

        }
    }

}

export default ProductController;