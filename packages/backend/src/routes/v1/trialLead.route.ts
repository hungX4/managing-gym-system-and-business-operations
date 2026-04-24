import { Router } from 'express';
import { TrialLeadController } from '../../controllers/v1/trial-lead.controller';
import { AuthMiddleware } from '../../middleware/auth.middleware';
import { CreateTrialLeadDto, Role } from '@gym/shared';
import Validate from '../../middleware/validate.middleware';
// import { requireAuth, requireRoles } from '../middlewares/auth.middleware'; 

const trialRouter = Router();

// 1. Endpoint cho Website ngoài (Không cần đăng nhập)
trialRouter.post('/web',
    Validate(CreateTrialLeadDto),
    TrialLeadController.createWebLead);

// Lấy danh sách Leads
trialRouter.get('/',
    AuthMiddleware.authenticate,
    AuthMiddleware.authorize(Role.ADMIN),
    TrialLeadController.getLeads
);

// Cập nhật Lead (Giao việc, chuyển trạng thái, note)
trialRouter.patch('/:id',
    AuthMiddleware.authenticate,
    AuthMiddleware.authorize(Role.ADMIN),
    TrialLeadController.updateLeadDetails
);

export default trialRouter;