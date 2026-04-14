// packages/backend/src/routes/checkin.routes.ts

import { Router } from 'express';
import { CheckinController } from '../../controllers/v1/checkin.controller';
import { AuthMiddleware } from '../../middleware/auth.middleware';
import { Role } from '@gym/shared';

const checkinRouter = Router();
const checkinCtrl = new CheckinController();

// Luồng 1: Tự tập (Staff dùng máy scan hoặc nhập SĐT)
checkinRouter.post(
    '/self',
    AuthMiddleware.authenticate,
    AuthMiddleware.authorize(Role.STAFF, Role.ADMIN),
    checkinCtrl.selfCheckin
);

// Luồng 2: Class Dance/Yoga
checkinRouter.post(
    '/class',
    AuthMiddleware.authenticate,
    AuthMiddleware.authorize(Role.STAFF, Role.ADMIN),
    checkinCtrl.classCheckin
);


// Luồng 3: PT 1-1 (Ghi nhận Completed hoặc Late Cancel)
checkinRouter.post(
    '/pt',
    AuthMiddleware.authenticate,
    AuthMiddleware.authorize(Role.STAFF, Role.ADMIN),
    checkinCtrl.ptCheckin
);

//tach phan nay sau
checkinRouter.get(
    '/history/:subscriptionId',
    AuthMiddleware.authenticate,
    AuthMiddleware.authorize(Role.STAFF, Role.ADMIN, Role.MEMBER), // Member cũng có thể xem lịch sử của chính họ
    checkinCtrl.getHistory
);
export default checkinRouter;