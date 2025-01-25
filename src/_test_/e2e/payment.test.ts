import { Express } from "express";
import { DataSource } from "typeorm";
import { DBConnection, DBDisconect } from "../../config/db.config";
import { serverforTest } from "../..";
import request from 'supertest';
import { User, UserRole } from "../../models/entity/User.entity";
import { Cart } from "../../models/entity/Cart.entity";
import UserService from "../../services/user.service";
import { Product } from "../../models/entity/Product.entity";
import { env } from "../../config/env.config";
import { IProduct, IProductRes } from "../../models/interface/product.interface";
import { Order } from "../../models/entity/Order.entity";
import { OrderService } from "../../services/order.service";
import { CartService } from "../../services/cart.service";

describe("POST /user/checkout", () => {
    let userToken: string;
    let app: Express;
    let DB: DataSource;
    let products: IProductRes[] = [];


    beforeAll(async () => {
        // add product
        // create a user
        // add products to cart
        const templateURL = "/public/images/template.jpg";
        const testProducts:{
            [key:string]: IProduct
        } = {
            "shoes": {
                name: "boots",
                description: "Black leather lace-up ankle boots",
                stock: 10,
                price: 120,
                category: "shoes",
                imageURLs: [templateURL,templateURL,templateURL]

            },
            "jacket": {
                name: "jacket",
                description: "Bright yellow zip-up jacket",
                stock: 20,
                price: 150,
                category:"tops",
                imageURLs: [templateURL,templateURL]
            },
            "jeans": {
                name: "jeans",
                description: "Light wash denim jeans",
                stock: 15,
                price: 90,
                category: 'bottoms',
                imageURLs: [templateURL,templateURL, templateURL]

            }
        }

        let adminToken: string;
        // connect to database
        DB = await DBConnection();
        // initialize the test server
        app = await serverforTest();
        // signup up a user, fetch a token
        const userRes = await request(app).post('/user/signup').send({
            email: "user@forCheckout7.com",
            name: 'tester7',
            password: "userforCheckout123"
        });

        expect(userRes.status).toBe(201);
        expect(userRes.body.success).toBe(true);
        expect(userRes.body.data).toHaveProperty('token');

        userToken = userRes.body.data.token;

        // log in the admin, add some products
        const adminRes = await request(app).post('/admin/login').send({
            email: env.ADMIN_EMAIL,
            password: env.ADMIN_PW
        });

        expect(adminRes.status).toBe(200);
        expect(adminRes.body.success).toBe(true);
        expect(adminRes.body.data).toHaveProperty('token');
        adminToken = userRes.body.data.token;

        // Add test products
        await Promise.all(Object.keys(testProducts).map(async (key) => {
        const response = await request(app).post('/admin/products/add').send(testProducts[key])
        .set("Authorization", `Bearer ${adminToken}`);
        
        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('id');
        }))

        // Fetch all products
        const productsRes = await request(app).get('/products');
        expect(productsRes.status).toBe(200);
        expect(productsRes.body.success).toBe(true);
        const expectedProducts = Object.values(testProducts);

        // Ensure response body contains an array with expected products, ignoring extra properties
        expect(productsRes.body.data).toEqual(
            expect.arrayContaining(
                expectedProducts.map(product => expect.objectContaining({
                    ...product,
                    price: product.price.toString()
                }))
            )
        );

        products = [...productsRes.body.data];
    })

    afterAll(async () => {
        // remove the user and cart
        const userRepo = DB.getRepository(User);
        const cartRepo = DB.getRepository(Cart);
        const cartService = new CartService(cartRepo);
        const userService = new UserService(userRepo);
        const orderRepo = DB.getRepository(Order);
        const orderService = new OrderService(orderRepo);
        const orders = await orderRepo.find();
        if(orders &&orders.length > 0){
            await Promise.all(orders.map(async(order) => {
                return await orderService.remove(order);
            }) )
        }
        const carts = await cartRepo.find();
        await Promise.all(carts.map(async (cart) => {
            await cartService.remove(cart);
        }))
        const users = await userRepo.find({where:{role: UserRole.USER}});
        await Promise.all(users.map(async (user) => {
            await userService.remove(user);
        }))


        expect(await cartRepo.count()).toEqual(0); 
        expect(await userRepo.count()).toEqual(1); //the admin

        // delete all products
        const productRepo = DB.getRepository(Product);
        const products = await productRepo.find();
        await Promise.all(products.map(async (p) => {
            await productRepo.delete(p.id);
        }))

        expect(await productRepo.count()).toEqual(0);
        // disconnect database
        await DBDisconect();
    })

    describe("Successfully checkout", () => {

        beforeAll(async () => {
            // add products in cart
            await Promise.all(products.map(async(product) => {
            const response = await request(app).post('/user/cart/add').send({
                productId: product.id,
                quantity: 2
            })
            .set("Authorization", `Bearer ${userToken}`);
            
            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('id');
            expect(response.body.data).toHaveProperty('quantity');
            }))

            const response = await request(app).get("/user/cart/all").send()
            .set("Authorization", `Bearer ${userToken}`);


            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);


        })

        it('should check out succssfully', async () => {
            const response  = await request(app).post("/user/checkout").send()
            .set("Authorization", `Bearer ${userToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('clientSecret');
        },10000)

    })
})