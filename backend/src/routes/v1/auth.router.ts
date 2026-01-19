import { Router } from "express";
import { login, register } from "../../controllers/auth.controller";

const authRoute = Router();

authRoute.post('/login', login);
authRoute.post('/register', register)

export default authRoute;