import { Router } from 'express';
import { MemberSubscriptionController } from '../../controllers/v1/member-subscription.controller';
import { AuthMiddleware } from '../../middleware/auth.middleware';
import { Role } from '@gym/shared';

const memberSubscriptionRoute = Router();
const controller = new MemberSubscriptionController();

// Lưu ý: Nếu bạn có Middleware check quyền, hãy gắn vào đây
// VD: router.post('/contract', requireRole(['ADMIN', 'STAFF']), controller.createContract);

// 1. API cho nhân viên bán (Offline)
memberSubscriptionRoute.post('/contract',
    AuthMiddleware.authenticate,
    AuthMiddleware.authorize(Role.ADMIN, Role.COACH, Role.STAFF),
    controller.createContract
);

// 2. API cho khách tự mua (Online)
memberSubscriptionRoute.post('/online', controller.buyOnline);


// Lấy danh sách gói tập của hội viên
// (Nhớ thêm middleware check token vào trước controller nếu bạn đã viết middleware)
memberSubscriptionRoute.get('/',
    AuthMiddleware.authenticate,
    controller.getMemberSubscriptions);
export default memberSubscriptionRoute;