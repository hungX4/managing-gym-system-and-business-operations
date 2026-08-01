import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../entities/user.entity";
import { CoachResponseDto, MemberSearchResponseDto, Role } from "@gym/shared";
import { CoachProfile } from "../entities/coachProfile.entity";

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userReposistory: Repository<User>
    ) { }

    //search by name
    async searchMembers(keyword: string): Promise<MemberSearchResponseDto[]> {
        if (!keyword.trim()) return [];

        const members = await this.userReposistory.createQueryBuilder('user')
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

    async getAllUsers() {
        return await this.userReposistory.find();
    }

    async getAllCoaches(): Promise<CoachResponseDto[]> {
        const coaches = await this.userReposistory.find({
            where: { role: Role.COACH },
            relations: ['coachProfile'],
        })

        return coaches.map(coach => ({
            userId: coach.userId,
            fullName: coach.fullName,
            phone: coach.phone,
            avatarUrl: coach.avatarUrl || null,
            profileId: coach.coachProfile?.profileId || null,
            coachType: coach.coachProfile?.type || null,
            coachLevel: coach.coachProfile?.level || null,
            bio: coach.coachProfile?.bio || null

        }))
    }

    async getUserById(id: string) {
        return await this.userReposistory.findOne({
            where: { userId: id as any }
        });
    }

    async updateUser(userId: string, data: Partial<User>) {
        const user = await this.userReposistory.findOneBy({ userId: userId as any });

        // Sử dụng Exception chuẩn của NestJS thay vì throw Error thông thường
        if (!user) throw new NotFoundException('USER_NOT_FOUND');

        if (Object.keys(data).length === 0) return user;

        Object.assign(user, data);

        return await this.userReposistory.save(user);
    }
}