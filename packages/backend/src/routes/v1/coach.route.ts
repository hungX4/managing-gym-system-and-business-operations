// packages/backend/src/routes/coach.routes.ts

import { Router } from 'express';
import { CoachController } from '../../controllers/v1/coach.controller';
import { AuthMiddleware } from '../../middleware/auth.middleware';
import { Role } from '@gym/shared';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../../config/cloudinary';

const coachRouter = Router();

// Cấu hình kho lưu trữ Cloudinary cho Multer giống hệt User
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (_req, _file) => ({
        folder: 'gym_avatar', // Có thể đổi thành 'coach_avatar' nếu muốn tách riêng thư mục
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    }),
});

const upload = multer({ storage });

// ==========================================
// 1. PUBLIC ROUTES (Dành cho việc xem danh sách)
// ==========================================

// API lấy danh sách toàn bộ Coach 
// (Tùy nghiệp vụ: Nếu muốn ai cũng xem được HLV thì bỏ authenticate, nếu bắt đăng nhập thì giữ lại)
coachRouter.get(
    '/',
    CoachController.getAllCoaches
);


// ==========================================
// 2. PRIVATE ROUTES (Chỉ dành riêng cho COACH)
// ==========================================

// API lấy thông tin Profile của chính Coach đang đăng nhập
coachRouter.get(
    '/me',
    AuthMiddleware.authenticate,
    AuthMiddleware.authorize(Role.COACH), // Bảo mật: Chỉ Coach mới được xem
    CoachController.getMe
);

// API cập nhật thông tin cá nhân của Coach (Dùng PATCH cho đồng bộ với User)
coachRouter.patch(
    '/me',
    AuthMiddleware.authenticate,
    AuthMiddleware.authorize(Role.COACH), // Bảo mật: Chỉ Coach mới được sửa
    upload.single('avatar'), // Field name phía Frontend gửi lên là 'avatar'
    CoachController.updateMe
);

export default coachRouter;