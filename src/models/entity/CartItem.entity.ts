import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, Check } from "typeorm";
import { Cart } from "./Cart.entity";
import { Product } from "./Product.entity";

@Entity()
@Check(`"quantity" > 0`)
export class CartItem{
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Cart, cart => cart.items, {onDelete: 'CASCADE'})
    cart: Cart;

    @ManyToOne(() => Product, product => product.items, {onDelete:"CASCADE"})
    product: Product;

    @Column('int')
    quantity: number;
}