// packages/backend/src/routes/user.routes.ts

import { Router } from 'express';
import { UserController } from '../../controllers/v1/user.controller';
import { AuthMiddleware } from '../../middleware/auth.middleware';
import { Role } from '@gym/shared';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../../config/cloudinary';
const userRouter = Router();

// Cấu hình kho lưu trữ Cloudinary cho Multer
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (_req, _file) => ({
        folder: 'gym_avatar', // Thư mục chứa ảnh trên Cloudinary
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    }),
});

const upload = multer({ storage });

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
    '/:id',
    upload.single('avatar'), // Field name phía Frontend gửi lên
    UserController.updateProfile
);

export default userRouter;