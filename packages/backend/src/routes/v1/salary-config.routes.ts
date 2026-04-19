import { Router } from 'express';
import { SalaryConfigController } from '../../controllers/v1/salary-config.controller'; // (Nhớ chỉnh lại đường dẫn cho đúng thư mục của bạn)
import { AuthMiddleware } from '../../middleware/auth.middleware';
import { Role } from '@gym/shared';

const salaryConfigRoute = Router();
const controller = new SalaryConfigController();

// 1. Lấy danh sách cấu hình lương
// (Thường thì chỉ ADMIN mới được xem, nếu bạn muốn Lễ tân xem thì thêm Role.STAFF vào authorize)
salaryConfigRoute.get('/',
    AuthMiddleware.authenticate,
    AuthMiddleware.authorize(Role.ADMIN),
    controller.getAllConfigs
);

// 2. Cập nhật / Tạo mới cấu hình lương 
salaryConfigRoute.put('/',
    AuthMiddleware.authenticate,
    AuthMiddleware.authorize(Role.ADMIN),
    controller.updateConfigs
);

export default salaryConfigRoute;