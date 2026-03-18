import { Request, Response } from "express";
import { AuthServices } from "src/services/auth.services";

export class AuthController {

    static register = async (req: Request, res: Response) => {
        try {
            const result = await AuthServices.register(req.body);
            res.status(201).json(result);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    static login = async (req: Request, res: Response) => {

    }
}


