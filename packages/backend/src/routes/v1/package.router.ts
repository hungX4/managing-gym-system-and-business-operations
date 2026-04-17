import { Router } from 'express';
import { PackageController } from '../../controllers/v1/package.controller';
import { AuthMiddleware } from '../../middleware/auth.middleware';
import { Role } from '@gym/shared';

const packageRouter = Router();
const packageController = new PackageController();

// Thêm gói tập mới (Chỉ Admin mới có quyền tạo)
packageRouter.post(
    '/',
    AuthMiddleware.authenticate,
    AuthMiddleware.authorize(Role.ADMIN),
    packageController.createPackage
);

// Thêm gói tập mới (Chỉ Admin mới có quyền tạo)
packageRouter.get(
    '/',
    AuthMiddleware.authenticate,
    AuthMiddleware.authorize(Role.ADMIN),
    packageController.getAllPackages
);

//update status
packageRouter.patch(
    '/:id/status',
    AuthMiddleware.authenticate,
    AuthMiddleware.authorize(Role.ADMIN),
    packageController.toggleStatus
);

export default packageRouter;