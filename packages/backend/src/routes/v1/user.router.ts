// packages/backend/src/routes/user.routes.ts

import { Router } from 'express';
import { UserController } from '../../controllers/v1/user.controller';
import { AuthMiddleware } from '../../middleware/auth.middleware';
import { Role } from '@gym/shared';

const userRouter = Router();
const userCtrl = new UserController();

// API tìm kiếm khách hàng (Coach, Staff, Admin đều dùng được)
userRouter.get(
    '/search',
    AuthMiddleware.authenticate,
    AuthMiddleware.authorize(Role.COACH, Role.STAFF, Role.ADMIN),
    userCtrl.searchMembers
);

export default userRouter;