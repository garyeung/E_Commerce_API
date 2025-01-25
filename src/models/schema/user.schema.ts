import {z} from 'zod'

export const signupSchema = z.object({
    name: z.string().min(1, "Name is required").max(100, "Name must be at most 100 characters long"),
    email: z.string().email("Invalid email address").max(100, "Email must be at most 100 characters long"),
    password: z.string().min(8, "Passsword must be at least 8 characters long").max(255, "Password must be at most 255 characters long"),
})

export const loginSchema = z.object({
    email: z.string().email("Invalid email address").max(100, "Email must be at most 100 characters long"),
    password: z.string().min(8, "Passsword must be at least 8 characters long").max(255, "Password must be at most 255 characters long"),
})
