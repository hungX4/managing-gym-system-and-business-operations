import { plainToInstance } from "class-transformer";
import { validate, ValidationError } from "class-validator";
import { NextFunction, Request, Response } from "express";

export default function Validate(dtoClass: any) {
    return async (req: Request, res: Response, next: NextFunction) => {
        //convert to instance of dto class
        const dtoObject = plainToInstance(dtoClass, req.body);

        const errors = await validate(dtoObject);

        if (errors.length > 0) {
            const errorMessages = errors.map((error: ValidationError) => {
                return Object.values(error.constraints || {}).join(', ');
            })
            return res.status(400).json({
                message: 'Dữ liệu đầu vào không hợp nệ!',
                errors: errorMessages
            });
        }
        //pass, thay bằng dto đã đc chuẩn hóa
        req.body = dtoObject;
        next();
    }
}