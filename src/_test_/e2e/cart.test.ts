// GET /user/cart/all     * 
// POST /user/cart/add    *  
// PUT /user/cart/update    * 
// DELETE /user/cart/delete  * 

import { Express } from "express";
import { DataSource } from "typeorm";
import { User, UserRole } from "../../models/entity/User.entity";
import { DBConnection, DBDisconect } from "../../config/db.config";
import { serverforTest } from "../..";
import request from 'supertest';
import { env } from "../../config/env.config";
import { IProduct, IProductRes } from "../../models/interface/product.interface";
import { Product } from "../../models/entity/Product.entity";
import { ICartItemReq, ICartItemRes } from "../../models/interface/cart.interface";
import { Cart } from "../../models/entity/Cart.entity";
import UserService from "../../services/user.service";

describe("Cart Endpoints", () => {
    let userToken :string;
    let app: Express;
    let DB: DataSource; 
    let products: IProductRes[] = [];

    beforeAll(async () => {
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
            email: "user@forcart123.com",
            name: 'tester',
            password: "userforcart123"
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
        const userService = new UserService(userRepo);
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

    describe("POST /user/cart/add", () => {
        let productToAdd:IProductRes;        
        let itemToAdd: ICartItemReq;

        beforeAll(async () => {
            // wait for products to inlitialize
            productToAdd = products[0]
            itemToAdd = {
                 productId: productToAdd.id,
                 quantity: 2
            } 

        })

       it("should add product successfully", async () => {

            const response = await request(app).post('/user/cart/add').send(itemToAdd)
            .set("Authorization", `Bearer ${userToken}`);
            
            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('id');
            expect(response.body.data).toHaveProperty('productName');
            expect(response.body.data.productName).toBe(productToAdd.name);

       })

       it("should fail to add product, if quantity greater than sotck", async () => {

            const response = await request(app).post('/user/cart/add').send({
                productId: itemToAdd.productId,
                quantity: 9999
            })
            .set("Authorization", `Bearer ${userToken}`);
            
            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toHaveProperty('message');

       })

       it("should fail to add product, if quantity is zero", async () => {

            const response = await request(app).post('/user/cart/add').send({
                productId: itemToAdd.productId,
                quantity: 0 
            })
            .set("Authorization", `Bearer ${userToken}`);
            
            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toHaveProperty('validationErrors');

       })


    }) 

    describe("DELETE /user/cart/delete", ()=> {
        let itemToDelete: ICartItemRes; 

        beforeAll(async () => {
            const response = await request(app).post('/user/cart/add').send({
                productId: products[0].id,
                quantity: 2
            })
            .set("Authorization", `Bearer ${userToken}`);
            
            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('id');
            expect(response.body.data).toHaveProperty('quantity');
            itemToDelete = response.body.data; 
        })

        it("should delete item successfully", async () => {
            const itemId = itemToDelete.id;

            const response = await request(app).delete("/user/cart/delete").send({
                id: itemId
            }).set("Authorization", `Bearer ${userToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty("message")
        })

        it("should fail to delete item wtih wrong id", async () => {
            const itemId = itemToDelete.id;

            const response = await request(app).delete("/user/cart/delete").send({
                id: itemId+9999
            }).set("Authorization", `Bearer ${userToken}`);

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toHaveProperty("message")
        })

    })

    describe("GET /user/cart/all", () => {
        beforeAll(async () => {
            // for test
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

            })
        )
        })

        it("should get cart successfully", async () =>{
            const response = await request(app).get("/user/cart/all").send()
            .set("Authorization", `Bearer ${userToken}`);


            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);

            const expectedProducts = Object.values(products);

            expect(response.body.data).toEqual(expect.arrayContaining(expectedProducts.map(proudct => 
                expect.objectContaining({
                    productId: proudct.id,
                    productImg: proudct.imageURLs[0],
                    productName: proudct.name,
                    productPrice: proudct.price,
                    quantity: 2
                    
                })
            )))
        })

    }) 

    describe("PUT /user/cart/update", () => {
        let itemToUpdate: ICartItemRes; 

        beforeAll(async () => {
            const response = await request(app).post('/user/cart/add').send({
                productId: products[0].id,
                quantity: 2
            })
            .set("Authorization", `Bearer ${userToken}`);
            
            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('id');
            expect(response.body.data).toHaveProperty('quantity');
            itemToUpdate = response.body.data; 
        })

        it('should update item successfully', async ()=> {
            const response = await request(app).put("/user/cart/update").send({
                id: itemToUpdate.id,
                quantity: itemToUpdate.quantity+1
            })
            .set("Authorization", `Bearer ${userToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.id).toEqual(itemToUpdate.id);
            expect(response.body.data.quantity).toBeGreaterThan(itemToUpdate.quantity);
        })

        it('should fail to update item if quantity greater than stock', async ()=> {
            const response = await request(app).put("/user/cart/update").send({
                id: itemToUpdate.id,
                quantity: itemToUpdate.quantity+9999
            })
            .set("Authorization", `Bearer ${userToken}`);

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toHaveProperty("message");
        })

    })
})