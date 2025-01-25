import { Column, Entity, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User.entity";
import { CartItem } from "./CartItem.entity";

@Entity()
export class Cart{
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => User, user => user.cart)
    user: User;

    @OneToMany(() => CartItem, cartItem => cartItem.cart, {cascade: true, onDelete: 'CASCADE'})
    items: CartItem[];
}
