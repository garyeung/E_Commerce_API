import { FindOptionsWhere, Repository } from "typeorm";
import BaseService from "./BaseService";
import { Order, OrderStatus } from "../models/entity/Order.entity";
import { OrderItem } from "../models/entity/OrderItem.entity";
import getRepo from "../models/repository/repo";

export class OrderService extends BaseService<Order>{
    constructor(repo: Repository<Order>){
        super(repo);
    }

    public update(options: FindOptionsWhere<Order>, status: OrderStatus){
        return this.handleDBOperation(
            'updating',
            async () => {
                const order = await this.Repository.findOne({where: options, relations: ['user']});
                if(!order){
                    throw new Error("Order not found");
                }
                order.status = status;
                return await this.Repository.save(order);
            }
        )        
    }

    public async remove(options: FindOptionsWhere<Order>){
        return this.handleDBOperation(
            'removing',
            async () => {
                return await this.Repository.manager.transaction(async (transactionManager) => {
                    const order = await transactionManager.findOne(Order, {
                        where: options
                    });
                    if(order){
                       const items = await transactionManager.find(OrderItem, {where: {order}});
                      // Remove related cart items
                      if (items && items.length > 0) {
                          await transactionManager.remove(OrderItem, items);
                      }
                      // Remove the cart
                      return await transactionManager.remove(Order, order);

                    }
                    return null;
                })
            }
        )
    }
}

export class OrderItemService extends BaseService<OrderItem>{
    constructor(repo: Repository<OrderItem>){
        super(repo)
    }
}

export const orderService = (async () => {
    const repo = await getRepo(Order); 
    return new OrderService(repo);
})();

export const orderItemService = (async () => {
    const repo = await getRepo(OrderItem); 
    return new OrderItemService(repo);
})();
