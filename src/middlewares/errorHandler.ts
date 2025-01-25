import { NextFunction, Request, Response } from "express";
import CustomError from "../models/utils/customError";
import { ZodError } from "zod";

function errorHandler(err: CustomError | ZodError, req: Request, res: Response, next: NextFunction){

    const statusCode = (err  instanceof ZodError)?400 : (err.statusCode || 500);

    res.status(statusCode).json({
        success: false,
        error:{
            message: err.message || 'Internal Server Error',
            ...(err instanceof ZodError && {validationErrors: err.errors})
        }
    })
};

export default errorHandler;