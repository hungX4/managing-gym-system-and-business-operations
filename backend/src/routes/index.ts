import { Router } from "express";
import v1Router from "./v1"; //auto find index.ts file in v1 folder
const router = Router();

router.use('/v1', v1Router);

export default router;