// controllers/v1/revenue.controller.ts
import { Request, Response } from 'express';
import { RevenueService } from '../../services/revenue.service';

export class RevenueController {
    private revenueService = new RevenueService();

    public getFullStats = async (req: Request, res: Response) => {
        try {
            const currentDate = new Date();
            const month = req.query.month ? parseInt(req.query.month as string) : currentDate.getMonth() + 1;
            const year = req.query.year ? parseInt(req.query.year as string) : currentDate.getFullYear();

            if (isNaN(month) || isNaN(year) || month < 1 || month > 12) {
                return res.status(400).json({ message: 'Tháng hoặc năm không hợp lệ' });
            }

            // Gọi hàm tổng hợp mới
            const data = await this.revenueService.getFullDashboardData(month, year);

            return res.status(200).json({
                success: true,
                message: 'Lấy dữ liệu Dashboard thành công',
                data: data
            });

        } catch (error) {
            console.error('Lỗi khi lấy thống kê:', error);
            return res.status(500).json({ success: false, message: 'Lỗi server nội bộ' });
        }
    }
}