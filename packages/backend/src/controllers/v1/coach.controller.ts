// packages/backend/src/controllers/v1/coach.controller.ts
import { Request, Response, NextFunction } from 'express';
import { CoachService } from '../../services/coach.service';

export class CoachController {

    // GET /api/v1/coaches (Dùng cho khách xem danh sách HLV)
    static getAllCoaches = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const coaches = await CoachService.getCoaches();
            res.status(200).json(coaches);
        } catch (error) {
            next(error);
        }
    }

    // GET /api/v1/coaches/me (Dùng cho Coach xem profile của chính mình)
    static getMe = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.sub as string;
            const profile = await CoachService.getMyProfile(userId);
            res.status(200).json(profile);
        } catch (error) {
            next(error);
        }
    }

    // PUT /api/v1/coaches/me (Dùng cho Coach tự cập nhật thông tin)
    static updateMe = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.sub as string;

            // NGHIỆP VỤ AN TOÀN: Bỏ coachType và coachLevel, chỉ nhận các trường cơ bản
            const { fullName, phone, bio } = req.body;

            const updateData: any = { fullName, phone, bio };

            if ((req as any).file) {
                updateData.avatarUrl = (req as any).file.path;
                updateData.avatarId = (req as any).file.filename;
            }

            const result = await CoachService.updateMyProfile(userId, updateData);
            res.status(200).json({
                message: "Cập nhật thông tin cá nhân thành công!",
                data: result
            });
        } catch (error) {
            next(error);
        }
    }
}