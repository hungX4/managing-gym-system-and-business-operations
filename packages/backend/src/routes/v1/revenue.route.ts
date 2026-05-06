import { Router } from 'express';
import { RevenueController } from '../../controllers/v1/revenue.controller';
import { AuthMiddleware } from '../../middleware/auth.middleware';
import { Role } from '@gym/shared';

const adminRouter = Router();
const revenueController = new RevenueController();
adminRouter.get('/',

    revenueController.getMonthlyStats);

export default adminRouter;