export interface ICartItemReq {
    productId: number;
    quantity: number
}

export interface IUpdateCartItemReq {
    id: number;
    quantity: number
}

export interface IDeleteCartItemReq {
    id: number
}

export interface ICartItemRes {
    id: number;
    productImg: string;
    productName: string;
    productPrice: number;
    productId: number;
    quantity: number
} 