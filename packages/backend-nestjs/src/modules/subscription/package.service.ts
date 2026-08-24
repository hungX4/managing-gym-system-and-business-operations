import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Package } from './entities/package.entity';
import { PackageResponseDto, PackageType } from '@gym/shared';
import { CreatePackageRequest } from './dto/package.dto';

@Injectable()
export class PackageService {
    constructor(
        @InjectRepository(Package)
        private readonly packageRepo: Repository<Package>
    ) { }

    async createPackage(dto: CreatePackageRequest): Promise<PackageResponseDto> {
        const existingPackage = await this.packageRepo.findOne({
            where: { name: dto.name.trim() }
        });

        if (existingPackage) {
            throw new ConflictException('Tên gói tập này đã tồn tại trên hệ thống, vui lòng chọn tên khác.');
        }

        // Chuẩn hóa dữ liệu và lưu DB
        const newPackage = this.packageRepo.create({
            name: dto.name.trim(),
            price: dto.price,
            type: dto.type,
            durationDays: dto.durationDays,
            // Nếu là gói MEMBERSHIP thì ép số buổi về null cho sạch dữ liệu
            totalSession: dto.type === PackageType.MEMBERSHIP ? null : dto.totalSessions,
            isActive: true
        });

        return await this.packageRepo.save(newPackage);
    }

    async getAllPackages(): Promise<PackageResponseDto[]> {
        return await this.packageRepo.find({
            order: { packageId: 'DESC' }
        });
    }

    async togglePackageStatus(packageId: number) {
        const pkg = await this.packageRepo.findOne({ where: { packageId } });

        if (!pkg) {
            throw new NotFoundException('Không tìm thấy gói tập.');
        }

        pkg.isActive = !pkg.isActive;
        return await this.packageRepo.save(pkg);
    }
}