import { AppDataSource } from "../models/data-source";
import { Package } from "../models/entity/Package";
import { PackageType } from "@gym/shared";
import { CreatePackageRequestDto } from "@gym/shared/src/dto/package.dto";

export class PackageService {
    private packageRepo = AppDataSource.getRepository(Package);

    async createPackage(dto: CreatePackageRequestDto) {
        const { name, price, type, totalSessions, durationDays } = dto;

        // 1. Kiểm tra dữ liệu bắt buộc cơ bản
        if (!name || price === undefined || !type || !durationDays) {
            throw new Error('MISSING_REQUIRED_FIELDS');
        }

        // 2. Ràng buộc nghiệp vụ theo Loại gói (Type)
        // Nếu là gói PT (COACHING), BẮT BUỘC phải có số buổi (totalSession) > 0
        if (type === PackageType.COACHING && (!totalSessions || totalSessions <= 0)) {
            throw new Error('COACHING_REQUIRES_TOTAL_SESSION');
        }

        // 3. Kiểm tra trùng lặp tên gói (Tránh Admin tạo 2 gói trùng tên gây nhầm lẫn lúc bán)
        const existingPackage = await this.packageRepo.findOne({ where: { name: name.trim() } });
        if (existingPackage) {
            throw new Error('PACKAGE_NAME_ALREADY_EXISTS');
        }

        // 4. Chuẩn bị dữ liệu lưu xuống DB
        const newPackage = this.packageRepo.create({
            name: name.trim(),
            price: price,
            type: type,
            // Nếu là gói MEMBERSHIP thì ép về null luôn cho sạch DB
            totalSession: type === PackageType.MEMBERSHIP ? null : totalSessions,
            durationDays: durationDays,
            isActive: true // Mặc định tạo xong là active để bán luôn
        });

        // 5. Lưu và trả về
        return await this.packageRepo.save(newPackage);
    }

    // Lấy toàn bộ danh sách gói tập (Sắp xếp mới nhất lên đầu)
    async getAllPackages() {
        return await this.packageRepo.find({
            order: { packageId: 'DESC' }
        });
    }

    // Thay đổi trạng thái Hoạt động / Tạm ngưng của gói tập
    async togglePackageStatus(packageId: number) {
        const pkg = await this.packageRepo.findOne({ where: { packageId } });
        if (!pkg) {
            throw new Error('PACKAGE_NOT_FOUND');
        }

        // Đảo ngược trạng thái hiện tại
        pkg.isActive = !pkg.isActive;
        return await this.packageRepo.save(pkg);
    }
}