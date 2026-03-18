import { Router } from "express";
import { AuthController } from "src/controllers/v1/auth.controller";

const authRoute = Router();

authRoute.post('/login', AuthController.login);
authRoute.post('/register', AuthController.register);

export default authRoute;