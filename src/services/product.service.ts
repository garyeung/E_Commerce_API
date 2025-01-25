import { DeepPartial, FindOptionsWhere, Repository } from "typeorm";
import BaseService from "./BaseService";
import { Product } from "../models/entity/Product.entity";
import getRepo from "../models/repository/repo";
import { CartItem } from "../models/entity/CartItem.entity";

class ProductService extends BaseService<Product>{
    constructor(repo: Repository<Product>){
        super(repo);
    }

    
    public async create(data: DeepPartial<Product>){
        return this.handleDBOperation(
            'creating',
            async () => {
                const is_active = data.stock? true: false;
                const newEntity = this.Repository.create({...data, is_active});
                return this.Repository.save(newEntity);
            }
        )
    }

    public async update(options: FindOptionsWhere<Product>, data:DeepPartial<Product>) {
        return this.handleDBOperation(
            'updating',
            async () => {
                const is_active = options.stock? true: false;
                await this.Repository.update(options, {...data, is_active})
                return this.findOne(options);

            }
        )
    }
    public async remove(options: FindOptionsWhere<Product>){
        return this.handleDBOperation(
            'removing',
            async () => {
                return await this.Repository.manager.transaction(async (t) => {
                    const product = await t.findOne(Product, {where: options});

                    if(!product){
                        throw new Error("Product not found")
                    }
                    const cartItems = await t.find(CartItem, {where:{
                        product
                    }});

                    if(cartItems && cartItems.length > 0){
                        await t.remove(CartItem, cartItems)
                    }

                    return await t.remove(Product, product);
                })
            }
        )
    }

}

export default ProductService;


export const productService = (async () => {
    const repo = await getRepo(Product);
    return new ProductService(repo);
})();
