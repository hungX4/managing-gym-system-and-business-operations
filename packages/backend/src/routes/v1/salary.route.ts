import { Router } from 'express';
import { SalaryController } from '../../controllers/v1/salary.controller';
import { AuthMiddleware } from '../../middleware/auth.middleware';
import { Role } from '@gym/shared';

const salaryRoute = Router();
const controller = new SalaryController();

// 1. Tính toán bảng lương tháng (Chỉ Admin/Manager mới được xem tổng thể)
salaryRoute.get('/',
    AuthMiddleware.authenticate,
    AuthMiddleware.authorize(Role.ADMIN), // Hoặc thêm Role.STAFF nếu bạn muốn
    controller.getSalaries
);

// Xem sao kê chi tiết (API Mới)
salaryRoute.get('/details',
    AuthMiddleware.authenticate,
    AuthMiddleware.authorize(Role.ADMIN, Role.COACH, Role.STAFF),
    controller.getSalaryDetails);

// Chốt lương tháng (API Mới)
salaryRoute.post('/finalize', AuthMiddleware.authenticate,
    AuthMiddleware.authorize(Role.ADMIN),
    controller.finalizeSalary);

// Thanh toán lương (API Mới)
salaryRoute.patch('/:id/pay',
    AuthMiddleware.authenticate,
    AuthMiddleware.authorize(Role.ADMIN),
    controller.paySalary);

export default salaryRoute;