import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Cart } from "./Cart.entity";
import { Order } from "./Order.entity";

export enum UserRole {
    USER = 'user',
    ADMIN = 'admin'
}

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        unique: true,
        type:'varchar',
        length: 100,
    })
    email: string;

    @Column({
        type: 'varchar',
        length: 100,
    })
    name: string;

    @Column({
            type: 'varchar',
            length: 255,
    })
    password: string;

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.USER
    })
    role: UserRole;

    @OneToOne(() => Cart, cart => cart.user, {
        cascade: true,
        onDelete: 'CASCADE' 
    })
    @JoinColumn()
    cart: Cart;

    @OneToMany(() => Order, order => order.user, {
        cascade: true,
        onDelete: 'CASCADE'
    })
    orders: Order[];
}