import { Request, Response } from 'express';
import { MemberSubscriptionService } from '../../services/member-subscription.services';

export class MemberSubscriptionController {
    private subscriptionService = new MemberSubscriptionService();

    // =========================================================
    // 1. NHÂN VIÊN TẠO HỢP ĐỒNG (OFFLINE)
    // =========================================================
    createContract = async (req: Request, res: Response) => {
        try {
            // Lấy toàn bộ data từ body
            const dto = req.body;

            // Gọi service xử lý
            const result = await this.subscriptionService.createContract(dto);

            return res.status(201).json({
                success: true,
                message: 'Tạo hợp đồng thành công!',
                data: result
            });
        } catch (error: any) {
            return res.status(400).json({
                success: false,
                message: error.message || 'Lỗi khi tạo hợp đồng'
            });
        }
    }

    // =========================================================
    // 2. KHÁCH TỰ MUA TRÊN WEB (ONLINE)
    // =========================================================
    buyOnline = async (req: Request, res: Response) => {
        try {
            // Trong thực tế, memberId sẽ được lấy từ Middleware xác thực (Token)
            // VD: const memberId = req.user.userId;
            // Ở đây mình code linh hoạt: ưu tiên lấy từ req.user, nếu không có thì lấy tạm từ body để bạn test Postman dễ hơn.
            const memberId = (req as any).user?.userId || req.body.memberId;

            if (!memberId) {
                return res.status(401).json({
                    success: false,
                    message: 'UNAUTHORIZED - Không tìm thấy thông tin thành viên'
                });
            }

            const dto = req.body;
            const result = await this.subscriptionService.buyOnline(memberId, dto);

            return res.status(201).json({
                success: true,
                message: 'Mua gói tập online thành công!',
                data: result
            });
        } catch (error: any) {
            return res.status(400).json({
                success: false,
                message: error.message || 'Lỗi khi mua online'
            });
        }
    }

    // =========================================================
    // 3. LẤY DANH SÁCH GÓI TẬP (Dùng chung cho cả Hội viên & Lễ tân)
    // =========================================================
    getMemberSubscriptions = async (req: Request, res: Response) => {
        try {
            // 1. Lấy thông tin user đang đăng nhập (từ Token middleware)
            // Giả sử req.user chứa thông tin từ Token
            const currentUser = (req as any).user;

            // Nếu không có token (bạn đang test thì hardcode currentUser tạm)
            if (!currentUser) {
                return res.status(401).json({ success: false, message: 'Vui lòng đăng nhập' });
            }

            let targetMemberId = currentUser.userId; // Mặc định là tự lấy của chính mình

            // 2. Nếu Lễ tân/Admin gọi, họ sẽ truyền memberId vào query (VD: ?memberId=123)
            const queryMemberId = req.query.memberId as string;

            if (queryMemberId) {
                // Kiểm tra xem người gọi có quyền xem của người khác không
                if (['ADMIN', 'STAFF', 'COACH'].includes(currentUser.roles)) {
                    targetMemberId = queryMemberId; // Cho phép xem của khách
                } else {
                    return res.status(403).json({ success: false, message: 'Bạn không có quyền xem gói tập của người khác' });
                }
            }

            // 3. Gọi service
            const result = await this.subscriptionService.getMemberSubscriptions(targetMemberId);

            return res.status(200).json({
                success: true,
                data: result
            });
        } catch (error: any) {
            return res.status(400).json({
                success: false,
                message: error.message || 'Lỗi khi lấy danh sách gói tập'
            });
        }
    }
}