import { Request, Response } from 'express';
import { SalaryService } from '../../services/salary.service';
import { GetSalaryDetailQueryDto, GetSalaryQueryDto } from '@gym/shared';

export class SalaryController {
    // Khởi tạo trực tiếp, không dùng constructor
    private salaryService = new SalaryService();

    // Lấy bảng tính lương
    getSalaries = async (req: Request, res: Response) => {
        try {
            // Mapping query param sang DTO
            const queryDto: GetSalaryQueryDto = {
                coachId: req.query.coachId ? Number(req.query.coachId) : undefined,
                month: Number(req.query.month),
                year: Number(req.query.year)
            };

            // Validate sơ bộ
            if (!queryDto.month || !queryDto.year) {
                return res.status(400).json({
                    success: false,
                    message: "Bắt buộc phải truyền month và year"
                });
            }

            // Gọi service xử lý
            const result = await this.salaryService.calculateSalary(queryDto);

            return res.status(200).json({
                success: true,
                message: `Lấy dữ liệu lương tháng ${queryDto.month}/${queryDto.year} thành công`,
                data: result
            });

        } catch (error: any) {
            console.error("Lỗi getSalaries: ", error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Lỗi server khi tính lương'
            });
        }
    }

    // 1. Chốt lương /post /api/v1/finalize
    finalizeSalary = async (req: Request, res: Response) => {
        try {
            const { month, year } = req.body;

            if (!month || !year) return res.status(400).json({ success: false, message: "Thiếu month hoặc year" });

            const result = await this.salaryService.finalizeSalary({ month, year });
            return res.status(200).json({
                success: true,
                message: `Đã chốt bảng lương tháng ${month}/${year} thành công!`,
                data: result
            });
        } catch (error: any) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }

    // 2. Thanh toán lương /patch api/v1/:id/pay
    paySalary = async (req: Request, res: Response) => {
        try {
            const salaryId = Number(req.params.id);
            if (!salaryId) return res.status(400).json({ success: false, message: "Thiếu salaryId" });

            const result = await this.salaryService.paySalary(salaryId);
            return res.status(200).json({
                success: true,
                message: "Đã đánh dấu thanh toán lương thành công!",
                data: result
            });
        } catch (error: any) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }

    // 3. Xem sao kê chi tiết /get api/v1/details
    getSalaryDetails = async (req: Request, res: Response) => {
        try {
            const queryDto: GetSalaryDetailQueryDto = {
                coachId: Number(req.query.coachId),
                month: Number(req.query.month),
                year: Number(req.query.year)
            };

            if (!queryDto.coachId || !queryDto.month || !queryDto.year) {
                return res.status(400).json({ success: false, message: "Thiếu coachId, month hoặc year" });
            }

            const result = await this.salaryService.getSalaryDetails(queryDto);
            return res.status(200).json({
                success: true,
                message: "Lấy chi tiết sao kê thành công",
                data: result
            });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
}