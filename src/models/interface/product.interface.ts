export interface IProduct {
    name: string;
    description: string;
    category: string;
    imageURLs: string[];
    price: number;
    stock: number;
}

export interface IProductRes extends IProduct {
    id: number;
    is_active:boolean;

}