import { NextFunction, Request, Response } from "express";
import { successResponse } from "./responseHandler";

async function handleRequest<T>(
    req: Request, 
    res: Response, 
    next:NextFunction,
    controllerLogic:(req:Request) => Promise<T>,
    statusCode: number) {
        try {
            const data = await controllerLogic(req); 
            successResponse<T>(statusCode,res,data);
            
        } catch (error) {
           next(error); 
        }
}
export default handleRequest;