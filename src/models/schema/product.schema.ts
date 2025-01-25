import { z } from 'zod';
export const productSchema = z.object({
    name: z.string().min(1, "Name is required").max(100),
    description: z.string().min(1, "Description is required"),
    category: z.string().min(1, "Category is required").max(100, "Category must be at most 100 characters long"),
    imageURLs: z.array(z.string().min(1, "image url is required")),
    price:  z.number().nonnegative("Price must be a non-negative number"),
    stock: z.number().int("Stock should be an integer").nonnegative("Stock must be a non-negative number"),
})
