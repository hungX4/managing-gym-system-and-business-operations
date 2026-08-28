import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Package } from './entities/package.entity';
import { PackageResponseDto, PackageType } from '@gym/shared';
import { CreatePackageRequest, PackageResponse } from './dto/package.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class PackageService {
    constructor(
        @InjectRepository(Package)
        private readonly packageRepo: Repository<Package>
    ) { }

    async createPackage(dto: CreatePackageRequest): Promise<PackageResponseDto> {
        //if package name existed
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

        const savedPackage = await this.packageRepo.save(newPackage);

        return plainToInstance(PackageResponse, savedPackage, {
            excludeExtraneousValues: true //lọc dữ liệu rác
        });
    }

    async getAllPackages(): Promise<PackageResponseDto[]> {
        const packageList = await this.packageRepo.find({
            order: { packageId: 'DESC' }
        });

        return plainToInstance(PackageResponse, packageList, {
            excludeExtraneousValues: true
        })
    }

    async togglePackageStatus(packageId: number) {
        const pkg = await this.packageRepo.findOne({ where: { packageId } });

        if (!pkg) {
            throw new NotFoundException('Không tìm thấy gói tập.');
        }

        pkg.isActive = !pkg.isActive;
        const updatedPkg = await this.packageRepo.save(pkg);
        return plainToInstance(PackageResponse, updatedPkg, {
            excludeExtraneousValues: true //lọc dữ liệu rác
        });
    }
}