import { Request, Response, NextFunction } from 'express';
import { PackageService } from '../../services/package.service';
import { CreatePackageRequestDto } from '@gym/shared/src/dto/package.dto';

export class PackageController {
    private packageService = new PackageService();

    // POST /api/v1/packages
    createPackage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            console.log("=== BODY TỪ FRONTEND GỬI LÊN ===", req.body);
            const dto = req.body as CreatePackageRequestDto;

            const result = await this.packageService.createPackage(dto);

            res.status(201).json({
                message: "Tạo gói tập mới thành công!",
                data: result
            });
        } catch (error: any) {
            // Mapping các lỗi từ Service thành HTTP Status Code báo về FE
            if (error.message === 'MISSING_REQUIRED_FIELDS') {
                res.status(400).json({ message: "Vui lòng cung cấp đầy đủ tên gói, giá tiền, loại gói và thời hạn." });
            } else if (error.message === 'COACHING_REQUIRES_TOTAL_SESSION') {
                res.status(400).json({ message: "Với gói tập PT 1-1, vui lòng nhập tổng số buổi tập." });
            } else if (error.message === 'PACKAGE_NAME_ALREADY_EXISTS') {
                res.status(409).json({ message: "Tên gói tập này đã tồn tại trên hệ thống, vui lòng chọn tên khác." });
            } else {
                next(error); // Các lỗi hệ thống khác đẩy về middleware xử lý lỗi tổng
            }
        }
    }

    // GET /api/v1/packages
    getAllPackages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const packages = await this.packageService.getAllPackages();
            res.status(200).json(packages);
        } catch (error) {
            next(error);
        }
    }

    // PATCH /api/v1/packages/:id/status
    toggleStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const packageId = parseInt(req.params.id as string);
            if (isNaN(packageId)) {
                res.status(400).json({ message: "ID gói tập không hợp lệ" });
                return;
            }

            const updatedPackage = await this.packageService.togglePackageStatus(packageId);
            res.status(200).json({
                message: `Đã ${updatedPackage.isActive ? 'mở bán' : 'tạm ngưng'} gói tập!`,
                data: updatedPackage
            });
        } catch (error: any) {
            if (error.message === 'PACKAGE_NOT_FOUND') {
                res.status(404).json({ message: "Không tìm thấy gói tập." });
            } else {
                next(error);
            }
        }
    }
}