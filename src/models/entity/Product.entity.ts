import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { CartItem } from "./CartItem.entity";

@Entity()
export class Product{
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'varchar',
        length: 100,
    })
    name: string;

    @Column()
    description: string;

    @Column('varchar',{length: 100})
    category: string;

    @Column('simple-array')
    imageURLs: string[];

    @Column('decimal')
    price: number;

    @Column('boolean', {default: false})
    is_active: boolean;

    @Column('int')
    stock: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(() => CartItem, item => item.product, {onDelete: 'CASCADE'})
    items: CartItem[];
}