import { Response } from 'express';
export function successResponse<T>(statusCode: number, res: Response, data:T) {

    res.status(statusCode).json({
        success: true,
        data: data
    });
}
