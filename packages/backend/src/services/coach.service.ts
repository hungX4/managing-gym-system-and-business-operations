// packages/backend/src/services/coach.service.ts
import { AppDataSource } from "../models/data-source";
import { User } from "../models/entity/User";
import { CoachProfile } from "../models/entity/CoachProfile";
import { Role } from "@gym/shared";
import { CoachResponseDto } from "../dto/user.dto"; // Import DTO của bạn

export class CoachService {
    private static userRepo = AppDataSource.getRepository(User);
    private static profileRepo = AppDataSource.getRepository(CoachProfile);

    // 1. LẤY DANH SÁCH TẤT CẢ COACH (Map chuẩn theo DTO bạn cung cấp)
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

    // 2. LẤY THÔNG TIN CÁ NHÂN CỦA COACH ĐANG ĐĂNG NHẬP (Trả về chuẩn DTO luôn)
    static async getMyProfile(userId: string): Promise<CoachResponseDto> {
        const coach = await this.userRepo.findOne({
            where: { userId: userId as any, role: Role.COACH },
            relations: ['coachProfile']
        });

        if (!coach) throw new Error('COACH_NOT_FOUND');

        return {
            userId: coach.userId,
            fullName: coach.fullName,
            phone: coach.phone,
            avatarUrl: coach.avatarUrl || null,
            profileId: coach.coachProfile?.profileId || null,
            coachType: coach.coachProfile?.type || null,
            coachLevel: coach.coachProfile?.level || null,
            bio: coach.coachProfile?.bio || null
        };
    }

    // 3. COACH TỰ CẬP NHẬT THÔNG TIN
    static async updateMyProfile(userId: string, data: any): Promise<CoachResponseDto> {
        const coach = await this.userRepo.findOne({
            where: { userId: userId as any, role: Role.COACH },
            relations: ['coachProfile']
        });

        if (!coach) throw new Error('COACH_NOT_FOUND');

        // Cập nhật thông tin cá nhân
        if (data.fullName) coach.fullName = data.fullName;
        if (data.phone) coach.phone = data.phone;
        if (data.avatarUrl) {
            coach.avatarUrl = data.avatarUrl;
            coach.avatarId = data.avatarId;
        }
        await this.userRepo.save(coach);

        // Cập nhật Profile chuyên môn (CHỈ CHO SỬA BIO)
        if (coach.coachProfile) {
            if (data.bio !== undefined) coach.coachProfile.bio = data.bio;
            await this.profileRepo.save(coach.coachProfile);
        } else {
            // Nếu chưa có profile, tạo mới với type/level mặc định là null hoặc từ default
            const newProfile = this.profileRepo.create({
                bio: data.bio,
                user: coach
            });
            await this.profileRepo.save(newProfile);
        }

        return this.getMyProfile(userId);
    }
}