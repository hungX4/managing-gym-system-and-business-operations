import { Role } from "@gym/shared";
import { AppDataSource } from "../models/data-source";
import { User } from "../models/entity/User";

export class UserServices {
    private userRepo = AppDataSource.getRepository(User);

    async searchMembers(keyword: string): Promise<any[]> {
        if (!keyword || keyword.trim() === '') return [];

        const member = await this.userRepo.createQueryBuilder('user')
            //join toi cac goi tap dang ACTIVE
            .leftJoinAndSelect('user.boughtSubscriptions', 'sub', 'sub.status = :subStatus', { subStatus: 'ACTIVE' })
            .where('user.role = :role', { role: Role.MEMBER })
            .andWhere('(user.phone LIKE :keyword OR user.fullName LIKE :keyword)', { keyword: `%${keyword}%` })
            .take(5) //lay 3 kq dau tien
            .getMany();

        return member.map(user => {
            // Tính tổng số buổi PT còn lại của member này
            const remainingPtSession = user.boughtSubscriptions?.reduce((total, sub) => {
                return total + (sub.remainingSession || 0);
            }, 0) || 0;
            //ktra xem còn gói tập đang kích hoạt k
            const activeSubs = user.boughtSubscriptions || [];
            const hasActivePackage = activeSubs.length > 0;

            // Tìm ngày hết hạn xa nhất trong các gói đang Active để Lễ tân biết
            let latestEndDate = null;

            if (hasActivePackage) {
                // Lấy ra mảng các endDate và tìm ngày lớn nhất
                const endDates = activeSubs.map(sub => new Date(sub.endDate).getTime());
                latestEndDate = new Date(Math.max(...endDates));
            }
            return {
                memberId: user.userId, // Lưu ý: userId trong entity của bạn là string
                fullName: user.fullName,
                phone: user.phone,
                avatarUrl: user.avartarUrl || null, // Trả về avatar để làm giao diện cục tròn
                remainingPtSession: remainingPtSession,
                hasActivePackage: hasActivePackage,
                latestEndDate: latestEndDate // Trả về để FE hiển thị ngày
            };
        });
    }

    //get all coach
    async getCoaches(): Promise<any[]> {
        const coaches = await this.userRepo.find({
            where: { role: Role.COACH },
            relations: ['coachProfile'], // Thực hiện JOIN với bảng CoachProfile
        });

        // Map data trả về theo định dạng CoachResponseDto
        return coaches.map(coach => ({
            userId: coach.userId,
            fullName: coach.fullName,
            phone: coach.phone,
            avatarUrl: coach.avartarUrl || null,
            profileId: coach.coachProfile?.profileId || null,
            coachType: coach.coachProfile?.type || null,
            coachLevel: coach.coachProfile?.level || null,
            bio: coach.coachProfile?.bio || null
        }));
    }
}