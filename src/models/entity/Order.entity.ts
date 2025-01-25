import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "./User.entity";
import { OrderItem } from "./OrderItem.entity";

export enum OrderStatus {
    Pending = 'pending',
    Success = 'success',
    Cancelled = 'cancelled',
}

@Entity()
export class Order {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'enum',
        enum: OrderStatus,
        default: OrderStatus.Pending,
    })
    status: OrderStatus;

    @Column('decimal')
    total: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updateAt: Date;

    @ManyToOne(() => User, user => user.orders, )
    user: User;

    @OneToMany(() => OrderItem, Item => Item.order, {cascade: true, onDelete: 'CASCADE'})
    items: OrderItem[];
}
