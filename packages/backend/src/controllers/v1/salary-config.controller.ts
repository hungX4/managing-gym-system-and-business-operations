import { Request, Response } from 'express';
// Nhớ đổi lại đường dẫn cho đúng
import { SalaryConfigService } from '../../services/salary-config.service';

export class SalaryConfigController {
    // Khởi tạo trực tiếp y hệt văn mẫu của bạn
    private salaryConfigService = new SalaryConfigService();
    // GET /api/v1/salaryconfig/
    getAllConfigs = async (req: Request, res: Response) => {
        try {
            const result = await this.salaryConfigService.getAllConfigs();

            return res.status(200).json({
                success: true,
                message: 'Lấy cấu hình lương thành công!',
                data: result
            });
        } catch (error: any) {
            console.error("Error in getAllConfigs:", error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Lỗi server khi lấy cấu hình lương'
            });
        }
    }

    // // PUT /api/v1/salaryconfig/
    updateConfigs = async (req: Request, res: Response) => {
        try {
            const dto = req.body;

            // Validate nhanh
            if (!dto.configs || !Array.isArray(dto.configs)) {
                return res.status(400).json({
                    success: false,
                    message: "Dữ liệu không hợp lệ. Phải là một mảng 'configs'."
                });
            }

            // Gọi service xử lý
            const result = await this.salaryConfigService.updateConfigs(dto);

            return res.status(200).json({
                success: true,
                message: 'Cập nhật cấu hình lương thành công!',
                data: result
            });
        } catch (error: any) {
            console.error("Error in updateConfigs:", error);
            return res.status(400).json({
                success: false,
                message: error.message || 'Dữ liệu cập nhật không hợp lệ'
            });
        }
    }
}