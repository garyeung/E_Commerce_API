import { NextFunction, Request, Response } from "express";
import PaymentService from "../services/payment.service";
import CustomError from "../models/utils/customError";
import { CartItemService, CartService } from "../services/cart.service";
import { OrderItemService, OrderService } from "../services/order.service";
import { CartItem } from "../models/entity/CartItem.entity";
import { OrderStatus } from "../models/entity/Order.entity";
import handleRequest from "../middlewares/requestHandler";
import ProductService from "../services/product.service";
import { Product } from "../models/entity/Product.entity";
import UserService from "../services/user.service";

// payment controller
        // find user cart according to user id 
        // calculate amount accroding to cart item
        // create pending order
        // clean cart item
        // after success or fail or something change order status

class PaymentController{
    private cartService: CartService;
    private paymentService: PaymentService;
    private orderService: OrderService;
    private orderItemService: OrderItemService;
    private cartItemService:CartItemService;
    private productService: ProductService;
    private userService: UserService;

    constructor(cartService: CartService, paymentService: PaymentService, orderService: OrderService, orderItemService: OrderItemService, cartItemService:  CartItemService, productService: ProductService, userService: UserService){
        this.cartService = cartService;
        this.cartItemService = cartItemService;
        this.orderService = orderService;
        this.paymentService = paymentService;
        this.orderItemService = orderItemService;
        this.productService = productService;
        this.userService = userService;

        this.checkout = this.checkout.bind(this);
        this.handleOrder = this.handleOrder.bind(this);
        this.calculateOrderAmount = this.calculateOrderAmount.bind(this);
        this.checkOrderStatus = this.checkOrderStatus.bind(this);
        this.updateProductStock = this.updateProductStock.bind(this);
    }

    async checkout(req: Request, res: Response, next: NextFunction  ){
        await handleRequest(req, res, next, async ()=> {
            const userId = req.user!.id

            // Find user's cart
            let cart =  await this.cartService.findOne({
                user:{
                    id: userId
                }
            })

            if(!cart){
                cart = await this.cartService.create({user: {id: userId}});

                throw new CustomError(400, "Empty cart is not allowed to check out");
            }

            const cartItems = await this.cartItemService.findAll({cart});

            if(cartItems.length <= 0){
                throw new CustomError(400, "Empty cart is not allowed to check out");

            }

            // check the product stock
            cartItems.forEach((item) => {
                if(item.product.stock < item.quantity){
                    throw new CustomError(400, `Product Id:${item.product.id}, Name: ${item.product.name} don't have enough stock`)
                }
            })

            // Calculate the total amount
            const amount = this.calculateOrderAmount(cartItems)

            // creat order
            const user = await this.userService.findOne({id: userId});
            if(!user){
                throw new CustomError(404, "User not found");
            }
            const order = await this.orderService.create({
                user,
                total: amount,
                status: OrderStatus.Pending
            })

            // creat order item
            await Promise.all(cartItems.map(async (item) => {
                await this.orderItemService.create({
                    productId: item.product.id,
                    productName: item.product.name,
                    price: item.product.price,
                    quantity: item.quantity,
                    order
                })
                // reduce product stock too!!!!
                await this.updateProductStock(item.product, item.product.stock-item.quantity)

                // empty cart item
                await this.cartItemService.delete(item);

            }))

            const paymentIntent = await this.paymentService.createPaymentIntent(order.id, amount);

            return {clientSecret: paymentIntent.client_secret};
        },200);
    }

    async handleOrder(req: Request, res: Response, next: NextFunction){
        await handleRequest(req, res , next, async () => {
        const sig = req.headers['stripe-signature'];
        const event = await this.paymentService.createWebhookEvent(req.body, sig!) ;

        switch(event.type){
            case 'payment_intent.succeeded':
                console.log('PaymentIntent was successfull');
                const orderId = event.data.object.metadata.orderId;

                await this.orderService.update({id:parseInt(orderId)},  OrderStatus.Success);
                break;

            case 'payment_intent.payment_failed':
                console.log('PaymentIntent failed!');

                const id = event.data.object.metadata.orderId;

                // the order will being be cancelled in 30 mins
                setTimeout(async () => {
                    await this.checkOrderStatus(parseInt(id))
                }, 30*60*1000);
                break;
            
            default:
                console.log(`Unhandled event type ${event.type}`);
        }
        return;

        },200)
    }

    private calculateOrderAmount(items: CartItem[]){
        return items.reduce((acc, item) => {
            return acc+(item.product.price*item.quantity)
        },0)
    }

    private async checkOrderStatus(id: number){
        try {
           const order = await this.orderService.findOne({id}); 
            if(order && order.status === OrderStatus.Pending){
                await this.orderService.update(
                    order, 
                    OrderStatus.Cancelled
                )

                // recover product stock according to quantity!!!!
                for (const item of order.items) {
                    const product = await this.productService.findOne({ id: item.productId });
                    if (product) {
                        await this.updateProductStock(product, product.stock + item.quantity);
                    }
                }

                console.log(`Order ${id} is cancelled`);
            }
        } catch (error) {  
           console.error(`Failed to cancel pending order: ${error}`); 
        }
    }

    private async updateProductStock(product:Product, stock: number){
        await this.productService.update({id:product.id}, {
            stock: stock,
            is_active: stock > 0
        })
    }

}

export default PaymentController;
