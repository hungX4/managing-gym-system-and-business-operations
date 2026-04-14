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
            .take(3) //lay 3 kq dau tien
            .getMany();

        return member.map(user => {
            // Tính tổng số buổi PT còn lại của member này
            const remainingPtSession = user.boughtSubscriptions?.reduce((total, sub) => {
                return total + (sub.remainingSession || 0);
            }, 0) || 0;

            return {
                memberId: user.userId, // Lưu ý: userId trong entity của bạn là string
                fullName: user.fullName,
                phone: user.phone,
                avatarUrl: user.avartarUrl || null, // Trả về avatar để làm giao diện cục tròn
                remainingPtSession: remainingPtSession
            };
        });
    }
}