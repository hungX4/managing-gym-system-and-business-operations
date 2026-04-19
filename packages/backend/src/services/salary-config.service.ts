import { EntityManager } from 'typeorm';
// Import các Enum từ file enums.ts của bạn (hoặc từ @gym/shared)
import { Role, CoachType, CoachLevel, UpdateSalaryConfigDto } from '@gym/shared';
import { SalaryConfig } from '../models/entity/SalaryConfig';
import { AppDataSource } from '../models/data-source';

export class SalaryConfigService {
    private salaryConfigRepo = AppDataSource.getRepository(SalaryConfig);


    getAllConfigs = async (): Promise<SalaryConfig[]> => {
        return await this.salaryConfigRepo.find({
            order: { configId: 'ASC' }
        });
    }

    updateConfigs = async (dto: UpdateSalaryConfigDto) => {
        const { configs } = dto;

        return await this.salaryConfigRepo.manager.transaction(async (transactionalEntityManager: EntityManager) => {
            for (const item of configs) {

                // 1. KIỂM TRA ROLE CÓ NẰM TRONG ENUM KHÔNG
                if (!Object.values(Role).includes(item.role)) {
                    throw new Error(`Role không hợp lệ: ${item.role}`);
                }

                // 2. XỬ LÝ LOGIC THEO TỪNG ROLE VÀ CHUẨN BỊ ĐIỀU KIỆN TÌM KIẾM
                const whereCondition: any = { role: item.role };

                if (item.role === Role.STAFF || item.role === Role.ADMIN) {
                    item.coachType = null;
                    item.coachLevel = null;
                    item.pricePerSession = 0;
                    // Với STAFF/ADMIN, chỉ cần tìm theo role là đủ
                }
                else if (item.role === Role.COACH) {
                    if (!item.coachType || !item.coachLevel) {
                        throw new Error("Coach bắt buộc phải có Loại (coachType) và Cấp độ (coachLevel)!");
                    }
                    if (!Object.values(CoachType).includes(item.coachType) || !Object.values(CoachLevel).includes(item.coachLevel)) {
                        throw new Error("Loại hoặc Cấp độ Coach không hợp lệ!");
                    }
                    // Với COACH, phải tìm chính xác theo Cả Loại và Cấp độ
                    whereCondition.coachType = item.coachType;
                    whereCondition.coachLevel = item.coachLevel;
                }

                // 3. CHỐNG TRÙNG LẶP (UPSERT LOGIC)
                // Tìm xem trong DB đã có cấu hình cho đối tượng này chưa
                const existingConfig = await transactionalEntityManager.findOne(SalaryConfig, {
                    where: whereCondition
                });

                if (existingConfig) {
                    // NẾU CÓ RỒI -> GHI ĐÈ LÊN BẢN GHI CŨ (Bỏ qua configId Frontend gửi)
                    await transactionalEntityManager.update(SalaryConfig, existingConfig.configId, item);
                } else {
                    // NẾU CHƯA CÓ -> TẠO MỚI (Lần đầu tiên hệ thống chạy)
                    const newConfig = transactionalEntityManager.create(SalaryConfig, item);
                    await transactionalEntityManager.save(newConfig);
                }
            }
            return true;
        });
    }
}