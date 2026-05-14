import { Request, Response } from "express";
import { OnlinePaymentService } from "../../services/onilnePayment.service";

export class OnlinePaymentController {
    private service = new OnlinePaymentService();

    async createPayment(req: Request, res: Response) {
        try {
            // 1. Lấy dữ liệu và ép kiểu
            const rawPackageId = req.body.packageId;
            const packageId = rawPackageId;

            // 2. KIỂM TRA NAN NGAY LẬP TỨC
            if (isNaN(packageId) || !rawPackageId) {
                return res.status(400).json({
                    message: "packageId không hợp lệ. Phải là một con số!"
                });
            }

            const userId = Number(req.user?.sub);
            if (isNaN(userId)) {
                return res.status(401).json({ message: "User ID không hợp lệ. Vui lòng đăng nhập lại." });
            }

            const ipAddr = req.ip || '127.0.0.1';

            // 3. Gọi service khi đã chắc chắn dữ liệu sạch
            const paymentUrl = await this.service.createVnpayUrl(userId, packageId, ipAddr);
            return res.json({ url: paymentUrl });

        } catch (error: any) {
            return res.status(500).json({ message: error.message });
        }
    }
    async vnpayIPN(req: Request, res: Response) {
        // Mọi logic kiểm tra đều nằm trong Service
        const result = await this.service.processVnpayIpn(req.query);
        return res.status(200).json(result);
    }
}