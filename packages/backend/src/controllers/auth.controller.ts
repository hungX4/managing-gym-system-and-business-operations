import { json } from "body-parser";
import { Request, Response } from "express";

const login = (req: Request, res: Response) => {
    const data = req.body;
    console.log(data);
    res.status(200).send(data);
}

const register = (req: Request, res: Response) => {
    const data = req.body;
    console.log(data);
    res.status(200).send(data);
}

export { login, register };