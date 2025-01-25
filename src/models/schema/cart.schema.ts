import { z } from "zod";

export const addCartItemScheme = z.object({
    productId: z.number().int("product id should be an integer"),
    quantity: z.number().int().positive( "quantity should be greater than 0"),
})

export const updateCartItemScheme = z.object({
    id: z.number().int("cart item id should be an integer"),
    quantity: z.number().int().positive( "quantity should be greater than 0"),

}
)

export const deleteCartItemScheme = z.object({
    id: z.number().int("cart item id should be an integer"),

})