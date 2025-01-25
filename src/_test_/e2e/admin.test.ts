// test 
// POST /admin/login    *
// GET /admin/products    *
// GET /admin/products/:id    * 
// POST /admin/products/add    * 
// PUT /admin/products/update/:id    * 
// DELETE /admin/products/remove/:id    -- delete  product

import { IUserLogin } from "../../models/interface/user.interface";
import { Express } from "express";
import request from 'supertest'
import { serverforTest } from "../..";
import { DBConnection, DBDisconect } from "../../config/db.config";
import { IProduct } from "../../models/interface/product.interface";
import { Repository } from "typeorm";
import { Product } from "../../models/entity/Product.entity";
import { env } from "../../config/env.config";

describe("Admin Endpoints", () => {
    let app: Express;
    let productRepo: Repository<Product>;

    let token: string;
    let adminEmail = env.ADMIN_EMAIL;   // replace to your admin email
    let adminPassword =  env.ADMIN_PW;    // replace to your admin password
    let loginData: IUserLogin = {
        email: adminEmail,
        password: adminPassword
    }

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
            stock: 2,
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
    beforeAll( async () => {
       productRepo =  (await DBConnection()).getRepository(Product);
        app = await serverforTest();

    })

    afterAll(async () => {
        // remove all testing product
        const products = await productRepo.find();
        await Promise.all(products.map(async (p) => {
            await productRepo.delete(p.id);
        }))

        expect(await productRepo.count()).toEqual(0);

        await DBDisconect();
    })

    beforeEach(async () => {
        // fetch token by login
        const response = await request(app).post('/admin/login').send(loginData);
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('token');

        token = response.body.data.token;

    })

    describe("POST /admin/login", () => {
        it("should fail to log in with invalid email", async () => {
            const invalidLoginData: IUserLogin = {
                email: "invalid"+adminEmail,
                password: adminPassword 
            }

            const response = await request(app).post('/admin/login').send(invalidLoginData);
            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toHaveProperty('message');
        })

        it("should fail to log in with wrong password", async () => {
            const invalidLoginData: IUserLogin = {
                email: adminEmail,
                password: "wrong"+adminPassword 
            }

            const response = await request(app).post('/admin/login').send(invalidLoginData);
            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toHaveProperty('message');
        })

    })

    describe("POST /admin/products/add", () => {
        it("should add products successfully", async () => {
            const response = await request(app).post('/admin/products/add').send(testProducts.shoes)
            .set("Authorization", `Bearer ${token}`);
            
            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('id');
            expect(response.body.data).toHaveProperty('name');
            expect(response.body.data.name).toBe(testProducts.shoes.name);
        })

        it("should fail to add empty products", async () => {
            const response = await request(app).post('/admin/products/add').send({})
            .set("Authorization", `Bearer ${token}`);
            
            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toHaveProperty('validationErrors');
        })
    })

    describe("PUT /admin/products/update/:id", () => {
        let id: number;
        let updatedProduct: IProduct = {
            ...testProducts.jeans,
            stock: 0
        } 

        beforeAll( async () => {

            const response = await request(app).post('/admin/products/add').send(testProducts.jeans)
            .set("Authorization", `Bearer ${token}`);
            
            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('id');
            id = parseInt(response.body.data.id);
        })

        it("should update product successfully", async () => {
            const response = await request(app).put('/admin/products/update/'+id)
            .send(updatedProduct)
            .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('id');
            expect(response.body.data.id).toEqual(id);
            expect(response.body.data).toHaveProperty("is_active");
            expect(response.body.data.is_active).toBeFalsy();
        })

        it("should fail to update product with wrong id", async () => {
            const response = await request(app).put('/admin/products/update/'+99999)
            .send(updatedProduct)
            .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toHaveProperty('message');
        })
    }) 
    
    describe("GET /admin/products", () => {
        beforeAll( async () => {
            await Promise.all(Object.keys(testProducts).map(async (key) => {
            const response = await request(app).post('/admin/products/add').send(testProducts[key])
            .set("Authorization", `Bearer ${token}`);
            
            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('id');

            }))
        })

        it('should get all products successfully', async () => {
            const response = await request(app).get('/admin/products')
            .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            // Convert testProducts object to an array of expected product properties
            const expectedProducts = Object.values(testProducts);

            // Ensure response body contains an array with expected products, ignoring extra properties
            expect(response.body.data).toEqual(
            expect.arrayContaining(
            expectedProducts.map(product => expect.objectContaining({
                ...product,
                price: product.price.toString()
            }))
            ))
        })

        it("should get the searched product successfully", async () => {
            const searchKey = 'bottoms'
            const matchingProducts:IProduct[] = Object.values(testProducts).map(p => {
                if(
                 (p.category.includes(searchKey))
               ||(p.name.includes(searchKey)) 
               || (p.description.includes(searchKey))
                ){
                return expect.objectContaining({
                        ...p,
                        price: p.price.toString() 
                    })
                
                }
            }).filter(Boolean);  // Remove null values

            const response = await request(app).get('/admin/products?search='+searchKey)
            .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect((response.body.data)).toEqual(expect.arrayContaining(matchingProducts));

        })

        it("should can't get the searched product successfully", async () => {
            const searchKey = 'there is no this search'

            const response = await request(app).get('/admin/products?search='+searchKey)
            .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect((response.body.data)).toEqual([]);

        })
    })

    describe("GET /admin/products/:id", () => {
        let id: number

        beforeAll(async () => {
            const response = await request(app).post('/admin/products/add').send(testProducts.shoes)
            .set("Authorization", `Bearer ${token}`);
            
            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('id');
            id= parseInt(response.body.data.id);
        })

        it("should get a prodcut successfully", async () => {
            const response = await request(app).get('/admin/products/'+id)
            .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('id');
            expect(response.body.data.id).toEqual(id);

        })

        it("should fail to get a prodcut wtih wrong id", async () => {
            const response = await request(app).get('/admin/products/'+99999)
            .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toHaveProperty('message');

        })
    })

    describe("DELETE /admin/products/remove/:id", () => {
        let id: number

        beforeAll(async () => {
            const response = await request(app).post('/admin/products/add').send(testProducts.shoes)
            .set("Authorization", `Bearer ${token}`);
            
            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('id');
            id= parseInt(response.body.data.id);
        })

        it("should delete a product successfully", async () => {
            const response = await request(app).delete("/admin/products/remove/"+id)
            .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('message');

            const doubleCheck = await request(app).get('/admin/products/'+id)
            .set("Authorization", `Bearer ${token}`);

            expect(doubleCheck.status).toBe(404);
            expect(doubleCheck.body.success).toBe(false);
            expect(doubleCheck.body.error).toHaveProperty('message');
        })

    })
})

