import { DeepPartial, FindOptionsWhere, Repository } from "typeorm";
import { User, UserRole } from "../models/entity/User.entity";
import BaseService from "./BaseService";
import getRepo from "../models/repository/repo";
import { Cart } from "../models/entity/Cart.entity";
import { CartItem } from "../models/entity/CartItem.entity";
import { Order } from "../models/entity/Order.entity";
import { OrderItem } from "../models/entity/OrderItem.entity";

class UserService extends BaseService<User>{
    constructor(repo: Repository<User>){
        super(repo);
    }

    public async create(data: DeepPartial<User>){
        return this.handleDBOperation(
            'creating',
            async () => {
                const newUser = this.Repository.create(data);
                if(newUser.role === UserRole.USER && !newUser.cart){
                    const newCart = new Cart();
                    newCart.user = newUser;
                    newUser.cart = newCart;
                }
                return this.Repository.save(newUser);

            }
        )
    }

    public async findOne(options: FindOptionsWhere<User>){
        return this.handleDBOperation(
            'finding',
            async () => {
                return this.Repository.findOne({where:options, relations:['cart']})
            }
        )
    }

    public async remove(options: FindOptionsWhere<User>){
        return this.handleDBOperation(
           'removing',
           async () => {
            return await this.Repository.manager.transaction(async (t) => {
                const user = await t.findOne(User, {where:options, relations:["cart"]});

                if (user) {
                    const cart = await t.findOne(Cart, {where:{user}})

                    if(cart){
                       const items = await t.find(CartItem, {where: {cart}});
                      // Remove related cart items
                      if (items && items.length > 0) {
                          await t.remove(CartItem, items);
                      }
                      // Remove the cart
                      await t.remove(Cart, cart);

                    }
                    
                    // remove orders and orders_items
                    const orders = await t.find(Order, {where:{user}});
                    if(orders && orders.length > 0){
                       await Promise.all( orders.map(async(order) => {
                            const items = await t.find(OrderItem, {
                                where: {order}
                            })
                            if(items && items.length > 0){
                                await t.remove(OrderItem,items);
                            }
                            await t.remove(Order, order)
                        })
                    )}
    
                    // Remove the user
                    return await t.remove(User, user);
                }
                return null;
            })
           }
        )

    }
}

export default UserService;

export const userService = (async() => {
    const repo = await getRepo(User);
    return new UserService(repo);
})();