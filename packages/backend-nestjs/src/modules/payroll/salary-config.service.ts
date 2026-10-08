// src/modules/salary/salary-config.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Role, CoachType, CoachLevel } from '@gym/shared';
import { SalaryConfig } from './entities/salary-config.entity';
import { UpdateSalaryConfigDto } from './dto/salary.dto';

@Injectable()
export class SalaryConfigService {
    constructor(
        @InjectRepository(SalaryConfig)
        private readonly salaryConfigRepo: Repository<SalaryConfig>,
        private readonly dataSource: DataSource,
    ) { }

    async getAllConfigs(): Promise<SalaryConfig[]> {
        return await this.salaryConfigRepo.find({
            order: { configId: 'ASC' },
        });
    }

    async updateConfigs(dto: UpdateSalaryConfigDto): Promise<boolean> {
        const { configs = [] } = dto;

        // 1. KIỂM TRA TRÙNG LẶP TRONG DỮ LIỆU GỬI LÊN (Tránh lỗi Duplicate Unique Key DB)
        const duplicateKeys = configs.map(
            (c) => `${c.role}_${c.coachType || 'NONE'}_${c.coachLevel || 'NONE'}`,
        );
        if (new Set(duplicateKeys).size !== duplicateKeys.length) {
            throw new BadRequestException('Dữ liệu gửi lên bị trùng lặp cấu hình (Cùng Role, Loại và Cấp độ)!');
        }

        return await this.dataSource.transaction(async (manager) => {
            // 2. LẤY TẤT CẢ DỮ LIỆU ĐANG CÓ TRONG DATABASE
            const existingInDb = await manager.find(SalaryConfig);

            // Lọc danh sách configId hợp lệ được Frontend gửi lên
            const incomingIds = configs
                .map((c) => Number(c.configId))
                .filter((id) => !isNaN(id) && id > 0);

            // 3. XỬ LÝ XÓA: Xóa tất cả các dòng trong DB mà Frontend KHÔNG còn gửi lên
            const recordsToDelete = existingInDb.filter(
                (dbItem) => !incomingIds.includes(dbItem.configId),
            );

            if (recordsToDelete.length > 0) {
                const idsToDelete = recordsToDelete.map((item) => item.configId);
                await manager.delete(SalaryConfig, idsToDelete);
            }

            // 4. XỬ LÝ THÊM / SỬA TỪNG DÒNG
            for (const item of configs) {
                if (!Object.values(Role).includes(item.role)) {
                    throw new BadRequestException(`Role không hợp lệ: ${item.role}`);
                }

                let coachType: CoachType | null = null;
                let coachLevel: CoachLevel | null = null;
                let pricePerSession = 0;

                if (item.role === Role.COACH) {
                    if (!item.coachType || !item.coachLevel) {
                        throw new BadRequestException(
                            'Coach bắt buộc phải chọn đầy đủ Loại (coachType) và Cấp độ (coachLevel)!',
                        );
                    }
                    if (
                        !Object.values(CoachType).includes(item.coachType) ||
                        !Object.values(CoachLevel).includes(item.coachLevel)
                    ) {
                        throw new BadRequestException('Loại hoặc Cấp độ Coach không hợp lệ!');
                    }
                    coachType = item.coachType;
                    coachLevel = item.coachLevel;
                    pricePerSession = Number(item.pricePerSession) || 0;
                }

                const baseSalary = Number(item.baseSalary) || 0;

                // ƯU TIÊN 1: Tìm bản ghi chính xác theo configId để SỬA
                let targetConfig: SalaryConfig | null = null;
                if (item.configId && Number(item.configId) > 0) {
                    targetConfig = await manager.findOne(SalaryConfig, {
                        where: { configId: Number(item.configId) },
                    });
                }

                // ƯU TIÊN 2: Nếu không có configId, tìm theo Bộ ba (Role + CoachType + CoachLevel)
                if (!targetConfig) {
                    const whereCond: any = { role: item.role };
                    if (item.role === Role.COACH) {
                        whereCond.coachType = coachType;
                        whereCond.coachLevel = coachLevel;
                    }
                    targetConfig = await manager.findOne(SalaryConfig, { where: whereCond });
                }

                if (targetConfig) {
                    // 🟢 THỰC HIỆN SỬA (UPDATE): Gán trực tiếp giá trị vào Entity Instance
                    targetConfig.role = item.role;
                    targetConfig.coachType = coachType;
                    targetConfig.coachLevel = coachLevel;
                    targetConfig.baseSalary = baseSalary;
                    targetConfig.pricePerSession = pricePerSession;

                    await manager.save(SalaryConfig, targetConfig);
                } else {
                    // 🟢 THỰC HIỆN THÊM MỚI (INSERT)
                    const newConfig = manager.create(SalaryConfig, {
                        role: item.role,
                        coachType,
                        coachLevel,
                        baseSalary,
                        pricePerSession,
                    });
                    await manager.save(SalaryConfig, newConfig);
                }
            }

            return true;
        });
    }
}