import { Entity, Check, PrimaryGeneratedColumn, ManyToOne, Column } from "typeorm";
import { Order } from "./Order.entity";

@Entity()
@Check(`"quantity" > 0`)
export class OrderItem{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    productId: number;

    @Column()
    productName: string;

    @Column('decimal')
    price: number;

    @Column('int')
    quantity: number;

    @ManyToOne(() => Order, order => order.items, {onDelete: 'CASCADE'})
    order: Order;

}