// packages/backend/src/services/user.service.ts
import { Role } from "@gym/shared";
import { AppDataSource } from "../models/data-source";
import { User } from "../models/entity/User";
import { MemberSearchResponseDto, CoachResponseDto } from "../dto/user.dto";

export class UserService {
    private static userRepo = AppDataSource.getRepository(User);

    // Sử dụng MemberSearchResponseDto
    static async searchMembers(keyword: string): Promise<MemberSearchResponseDto[]> {
        if (!keyword?.trim()) return [];

        const members = await this.userRepo.createQueryBuilder('user')
            .leftJoinAndSelect('user.boughtSubscriptions', 'sub', 'sub.status = :subStatus', { subStatus: 'ACTIVE' })
            .where('user.role = :role', { role: Role.MEMBER })
            .andWhere('(user.phone LIKE :keyword OR user.fullName LIKE :keyword)', { keyword: `%${keyword}%` })
            .take(5)
            .getMany();

        return members.map(user => {
            const activeSubs = user.boughtSubscriptions || [];

            // Tính tổng buổi PT còn lại
            const remainingPtSession = activeSubs.reduce((total, sub) => total + (sub.remainingSession || 0), 0);

            // Tìm ngày hết hạn xa nhất
            const latestEndDate = activeSubs.length > 0
                ? activeSubs.reduce((max, sub) => (new Date(sub.endDate) > new Date(max) ? sub.endDate : max), activeSubs[0].endDate)
                : null;

            return {
                memberId: Number(user.userId), // Cast sang number theo DTO của bạn
                fullName: user.fullName,
                phone: user.phone,
                avatarUrl: user.avatarUrl || null, // Map từ avartarUrl (Entity) -> avatarUrl (DTO)
                remainingPtSession: remainingPtSession,
                hasActivePackage: activeSubs.length > 0,
                latestEndDate: latestEndDate ? new Date(latestEndDate).toISOString() : null
            };
        });
    }

    // Sử dụng CoachResponseDto
    static async getCoaches(): Promise<CoachResponseDto[]> {
        const coaches = await this.userRepo.find({
            where: { role: Role.COACH },
            relations: ['coachProfile'],
        });

        return coaches.map(coach => ({
            userId: coach.userId,
            fullName: coach.fullName,
            phone: coach.phone,
            avatarUrl: coach.avatarUrl || null,
            profileId: coach.coachProfile?.profileId || null,
            coachType: coach.coachProfile?.type || null,
            coachLevel: coach.coachProfile?.level || null,
            bio: coach.coachProfile?.bio || null
        }));
    }

    static async getAllUsers() {
        return await this.userRepo.find();
    }

    static async getUserById(userId: string) {
        return await this.userRepo.findOne({ where: { userId }, relations: ['coachProfile'] });
    }

    static async updateUser(userId: string, data: Partial<User>) {
        // 1. Tìm user hiện tại. Cần ép kiểu userId nếu là string/number
        const user = await this.userRepo.findOneBy({ userId: userId as any });
        if (!user) throw new Error('USER_NOT_FOUND');

        // 2. Kiểm tra nếu 'data' không có trường nào để update thì trả về luôn user cũ
        if (Object.keys(data).length === 0) return user;

        // 3. Ghi đè dữ liệu mới vào user cũ
        Object.assign(user, data);

        // 4. Lưu lại. TypeORM save() sẽ tự động xử lý logic UPDATE
        return await this.userRepo.save(user);
    }
}