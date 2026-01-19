import { Router } from "express";
import authRoute from "./auth.router";

const router = Router();

router.use('/auth', authRoute);

export default router;