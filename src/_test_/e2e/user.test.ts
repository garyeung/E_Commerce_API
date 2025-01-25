import { serverforTest } from "../..";
import { DBConnection, DBDisconect } from "../../config/db.config"
import request from 'supertest';
import { Express } from 'express';
import { IUserLogin, IUserSignup } from "../../models/interface/user.interface";
import { Repository } from "typeorm";
import { User, UserRole } from "../../models/entity/User.entity";

describe("User Endpoints", () => {
    let app: Express; 
    let userRepo: Repository<User>;

    const testEmail ='testuser@example.com';     
    const testName = 'testuser';
    const testPassword =  'testpassword123';


    beforeAll(async () => {
        // initialize database and get user repository
        userRepo = (await DBConnection()).getRepository(User);
        app = await serverforTest();

    })

    afterAll(async () => {
        // remove all user (except admin) in database
        const users = await userRepo.find({where:{role: UserRole.USER}});
        await Promise.all(users.map(async (user) => {
            await userRepo.remove(user);
        }))


        expect(await userRepo.count()).toEqual(1); //the admin


        await DBDisconect();
    })

    describe("POST /user/signup", () => {
        // sigup success
        // sigup fail with exsiting email
        const signupData: IUserSignup = {
                email: testEmail,
                name: testName,
                password: testPassword            
            }

        it('should sign up a new user successfully', async () => {
            const response = await request(app).post('/user/signup').send(signupData);

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('token');
        })

        it('should fail to sign up with an exsiting email', async () => {
            const response = await request(app).post('/user/signup').send(signupData);

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toHaveProperty('message');
        })

    })

    describe("POST /user/login", () => {
        // should log in successfully
        // should fail to log in with wrong email
        // should fail to log in with wrong password

        it('should log in successfully', async () => {
            const loginData:  IUserLogin = {
                email: testEmail,
                password: testPassword
            } 

            const response = await request(app).post("/user/login").send(loginData);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('token');
        })

        it('should fail to log in with wrong email', async () => {
            const loginData: IUserLogin  = {
                email: "wrong"+testEmail,
                password: testPassword
            }

            const response = await request(app).post("/user/login").send(loginData);

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toHaveProperty('message');
        })

        it('should fail to log in with wrong password', async () => {
            const loginData: IUserLogin  = {
                email: testEmail,
                password: "wrong"+testPassword
            }

            const response = await request(app).post("/user/login").send(loginData);

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toHaveProperty('message');
        })
    })


})