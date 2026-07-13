// packages/backend/src/routes/user.routes.ts

import { Router } from 'express';
import { UserController } from '../../controllers/v1/user.controller';
import { AuthMiddleware } from '../../middleware/auth.middleware';
import { Role } from '@gym/shared';
import { upload } from '../../middleware/upload.middleware';
const userRouter = Router();

// API tìm kiếm khách hàng (Coach, Staff, Admin đều dùng được)
userRouter.get(
    '/search',
    AuthMiddleware.authenticate,
    AuthMiddleware.authorize(Role.COACH, Role.STAFF, Role.ADMIN), //xu ly chi cho coach vao duoc /booking
    UserController.searchMembers
);

// API lấy danh sách Coach 
userRouter.get(
    '/coaches',
    AuthMiddleware.authenticate,
    UserController.getCoaches
);

userRouter.get(
    '/',
    AuthMiddleware.authenticate,
    AuthMiddleware.authorize(Role.ADMIN),
    UserController.getAllUsers
);

userRouter.get('/:id', AuthMiddleware.authenticate, UserController.getUserProfile);

userRouter.patch(
    '/me',
    upload.single('avatar'), // Field name phía Frontend gửi lên
    AuthMiddleware.authenticate,
    UserController.updateProfile
);

export default userRouter;