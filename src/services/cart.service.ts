import { FindOptionsWhere, Repository } from "typeorm";
import BaseService from "./BaseService";
import { Cart } from "../models/entity/Cart.entity";
import { CartItem } from "../models/entity/CartItem.entity";
import getRepo from "../models/repository/repo";

export class CartService extends BaseService<Cart>{
    constructor(repo: Repository<Cart>){
        super(repo);
    }


    public async remove(options: FindOptionsWhere<Cart>){
        return this.handleDBOperation(
            'removing',
            async () => {
                return await this.Repository.manager.transaction(async (transactionManager) => {
                    const cart = await transactionManager.findOne(Cart, {
                        where: options
                    });
                    if(cart){
                       const items = await transactionManager.find(CartItem, {where: cart});
                      // Remove related cart items
                      if (items && items.length > 0) {
                          await transactionManager.remove(CartItem, items);
                      }
                      // Remove the cart
                      return await transactionManager.remove(Cart, cart);

                    }
                    return null;
                })
            }
        )
    }

}

export class  CartItemService extends BaseService<CartItem>{
    constructor(repo: Repository<CartItem>){
        super(repo);
    }

    public async findAll(options: FindOptionsWhere<CartItem>){
        return this.handleDBOperation(
            'finding all',
            async () => {
                return this.Repository.find({where:options, relations: ['cart', 'product']})
            }
        )
    }

    public async findOne(options: FindOptionsWhere<CartItem>){
        return this.handleDBOperation(
            'finding one',
            async () => {
                return this.Repository.findOne({where:options, relations: ['cart', 'product']})
            }
        )
    }

    public async update(options: FindOptionsWhere<CartItem>,quantity: number){
        return this.handleDBOperation(
            'updating',
            async () => {
                const item = await this.findOne(options)

                if (!item) {
                    throw new Error('Cart item not found');
                }
                if(quantity > item.product.stock){
                    throw new Error('updated quantity should be less than product stock');
                }
                item.quantity = quantity;
                return await this.Repository.save(item);
            }
        )
    }

}

export const cartService = (async () => {
    const repo = await getRepo(Cart);
    return new CartService(repo);
})();

export const cartItemService = (async () => {
    const repo = await getRepo(CartItem);
    return new CartItemService(repo);
})();
