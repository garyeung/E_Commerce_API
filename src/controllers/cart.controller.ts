import CustomError from "../models/utils/customError";
import {CartService, CartItemService} from "../services/cart.service";
import { NextFunction, Request, Response } from "express";
import ProductService from "../services/product.service";
import { ICartItemReq, IDeleteCartItemReq, ICartItemRes, IUpdateCartItemReq } from "../models/interface/cart.interface";
import handleRequest from "../middlewares/requestHandler";
import { CartItem } from "../models/entity/CartItem.entity";

class CartController{
    private cartService: CartService;
    private cartItemService: CartItemService;
    private productService: ProductService;

    constructor(cartService: CartService, cartItemService: CartItemService, productService: ProductService){
        this.cartService = cartService;
        this.cartItemService = cartItemService;
        this.productService = productService;

        this.addCartItem = this.addCartItem.bind(this);
        this.updateCartItem = this.updateCartItem.bind(this);
        this.deleteCartItem = this.deleteCartItem.bind(this);
        this.getCart = this.getCart.bind(this);
        this.buildCartItemRes = this.buildCartItemRes.bind(this);
    }

    async addCartItem(req: Request, res: Response, next:NextFunction){
        await handleRequest(req, res, next, async (req) => {
        const {productId, quantity}:ICartItemReq = req.body;
        const userId = req.user!.id;
        let cart = await this.cartService.findOne({user:{
            id: userId
        }});


        if(!cart){
            cart = await this.cartService.create({user: {id: userId}});
        }

        const product = await this.productService.findOne({id: productId});

        if(!product){
            throw new CustomError(404, 'Product not found');
        }

        if(quantity > product.stock){
            throw new CustomError(400, 'Not enough stock');
        }
        const addedItem = await this.cartItemService.create({cart, product, quantity});

        //console.log("AddedCartItem: ",addedItem)
        const result: ICartItemRes = this.buildCartItemRes(addedItem);
        return result

        }, 201)
    }

    async updateCartItem(req:Request, res: Response, next: NextFunction){
        await handleRequest(req, res, next, async (req) => {
        const {id, quantity}:IUpdateCartItemReq = req.body;
       
        const cartItem = await this.cartItemService.findOne({id});

        if(!cartItem){
            throw new CustomError(404, "Cart Item not found")
        }

        const product = await this.productService.findOne({id: cartItem.product.id});

        if(!product){
            throw new CustomError(404, 'Product not found');
        }

        if(quantity > product.stock){
            throw new CustomError(400, 'Not enough stock');
        }

        const updatedItem = await this.cartItemService.update({id:cartItem.id}, quantity);

        const result: ICartItemRes = this.buildCartItemRes(updatedItem) 
        return result;

        },200)
    }

    async deleteCartItem(req: Request, res: Response, next: NextFunction){
        await handleRequest(req, res, next, async (req) => {
        const {id: cartItemId}:IDeleteCartItemReq = req.body

        const cartItem = await this.cartItemService.findOne({id: cartItemId});

        if(!cartItem){
            throw new CustomError(404, "Cart Item not found")
        }

        const deleted = await this.cartItemService.delete({id: cartItemId});

       if(!deleted){
           throw new CustomError(500, 'Error deleting cart item internally');
       }

       return { message: 'Cart item deleted successfully'};
            
        }, 200)
    
    }

    async getCart(req: Request, res: Response, next: NextFunction){
        await handleRequest(req, res, next, async (req) => {
        const userId = req.user!.id;
        let cart = await this.cartService.findOne({user: {id: userId}});

        if(!cart){
            cart = await this.cartService.create({user: {id: userId}});
        }
        const items = await this.cartItemService.findAll({cart});

        //console.log("Get Cart: ", items);

        const result:ICartItemRes[] = items.map((item)=> {
            return this.buildCartItemRes(item); 
        })

        return result;

        }, 200)

    }

    private buildCartItemRes(item: CartItem):ICartItemRes{
        return {
            id: item.id,
            productId: item.product.id,
            productImg: item.product.imageURLs[0],
            quantity: item.quantity,
            productPrice: item.product.price,
            productName: item.product.name
        }
    }
}

export default CartController;