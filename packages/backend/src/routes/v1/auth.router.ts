import { Router } from "express";
import { AuthController } from "../../controllers/v1/auth.controller";
import { AuthMiddleware } from "../../middleware/auth.middleware";

const authRoute = Router();

authRoute.post('/login', AuthController.login);
authRoute.post('/register', AuthController.register);
authRoute.post('/refresh', AuthController.refresh);
authRoute.post('/logout', AuthMiddleware.authenticate, AuthController.logout);
authRoute.post('/logout-all', AuthMiddleware.authenticate, AuthController.logoutAll);

export default authRoute;