import { DataSource } from "typeorm";
import { env } from "./env.config";
import { Cart } from "../models/entity/Cart.entity";
import { CartItem } from "../models/entity/CartItem.entity";
import { Order } from "../models/entity/Order.entity";
import { Product } from "../models/entity/Product.entity";
import { User } from "../models/entity/User.entity";
import { OrderItem } from "../models/entity/OrderItem.entity";
import path from 'path';

const AppDateSouce = new DataSource({
    type: 'postgres',
    host: env.DB_HOST,
    port: env.DB_PORT,
    username: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    synchronize: env.NODE_ENV !== 'production',
    logging: false,
    entities: [User, Cart, CartItem, Product, Order, OrderItem],
    migrations: [path.join(__dirname, "./migrations/*.{js,ts}")],
    subscribers: []
})

export async function DBConnection(){
    if(AppDateSouce.isInitialized){
        return AppDateSouce;
    }
    else{
        try {
            const db = await AppDateSouce.initialize();
            console.log('Data Source has been initialized');
            return db;

        } catch (error) {
            console.error('Error initializing Data Source', error);

            throw new Error('Error initializing Data Source');
            
        }
    }
}
export const DBDisconect = async () => {
    await AppDateSouce.destroy()
}