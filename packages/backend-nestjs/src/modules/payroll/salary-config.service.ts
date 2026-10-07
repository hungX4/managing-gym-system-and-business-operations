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

        return await this.dataSource.transaction(async (transactionalEntityManager) => {
            for (const item of configs) {
                if (!Object.values(Role).includes(item.role)) {
                    throw new BadRequestException(`Role không hợp lệ: ${item.role}`);
                }

                const whereCondition: any = { role: item.role };

                if (item.role === Role.STAFF || item.role === Role.ADMIN) {
                    item.coachType = null;
                    item.coachLevel = null;
                    item.pricePerSession = 0;
                } else if (item.role === Role.COACH) {
                    if (!item.coachType || !item.coachLevel) {
                        throw new BadRequestException('Coach bắt buộc phải có Loại (coachType) và Cấp độ (coachLevel)!');
                    }
                    if (
                        !Object.values(CoachType).includes(item.coachType) ||
                        !Object.values(CoachLevel).includes(item.coachLevel)
                    ) {
                        throw new BadRequestException('Loại hoặc Cấp độ Coach không hợp lệ!');
                    }
                    whereCondition.coachType = item.coachType;
                    whereCondition.coachLevel = item.coachLevel;
                }

                const existingConfig = await transactionalEntityManager.findOne(SalaryConfig, {
                    where: whereCondition,
                });

                if (existingConfig) {
                    await transactionalEntityManager.update(SalaryConfig, existingConfig.configId, item);
                } else {
                    const newConfig = transactionalEntityManager.create(SalaryConfig, item);
                    await transactionalEntityManager.save(newConfig);
                }
            }
            return true;
        });
    }
}