import { Request, Response } from 'express';
import { RevenueService } from '../../services/revenue.service';

export class RevenueController {
    // Khởi tạo trực tiếp Service
    private revenueService = new RevenueService();

    // Dùng Arrow function để không bị mất context 'this'
    public getMonthlyStats = async (req: Request, res: Response) => {
        try {
            const currentDate = new Date();
            const month = req.query.month ? parseInt(req.query.month as string) : currentDate.getMonth() + 1;
            const year = req.query.year ? parseInt(req.query.year as string) : currentDate.getFullYear();

            if (isNaN(month) || isNaN(year) || month < 1 || month > 12) {
                return res.status(400).json({ message: 'Tháng hoặc năm không hợp lệ' });
            }

            // Gọi qua this.revenueService bình thường
            const data = await this.revenueService.getMonthlyRevenue(month, year);

            return res.status(200).json({
                success: true,
                message: 'Lấy thống kê doanh thu thành công',
                data: data
            });

        } catch (error) {
            console.error('Lỗi khi lấy thống kê doanh thu:', error);
            return res.status(500).json({
                success: false,
                message: 'Lỗi server nội bộ'
            });
        }
    }
}