import {Request, Response, NextFunction } from "express";
import { ZodError, ZodSchema } from "zod";


function validateRequest(schema: ZodSchema<any>){
    return (req: Request, res: Response, next: NextFunction) => {
            try {
                schema.parse(req.body);
                next();
    }catch(err){
        if(err instanceof ZodError){
        return next(err);
        }
        next(err);
    }
}
}

export default validateRequest;