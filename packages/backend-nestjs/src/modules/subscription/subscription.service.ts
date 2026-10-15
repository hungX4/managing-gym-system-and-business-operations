import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { MemberSubscription } from './entities/member-subscription.entity';
import { User } from '../user/entities/user.entity';
import { CreateContractDto } from './dto/create-contract.dto';
import { MemberSubscriptionStatus, PackageType, Role } from '@gym/shared';
import { Package } from './entities/package.entity';

@Injectable()
export class SubscriptionService {
    constructor(
        @InjectRepository(MemberSubscription)
        private readonly subRepo: Repository<MemberSubscription>,

        @InjectRepository(Package)
        private readonly packageRepo: Repository<Package>,

        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
    ) { }

    /**
     * 1. Luồng Offline: Nhân viên (Staff/Admin/Coach) tạo hợp đồng trực tiếp
     */
    async createContract(dto: CreateContractDto) {
        const { memberId, packageId, sellerId, startDate, discount, paymentMethod } = dto;

        // Validation ngày bắt đầu
        const start = new Date(startDate);
        if (isNaN(start.getTime())) {
            throw new BadRequestException('Ngày bắt đầu không hợp lệ!');
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const threeDaysAgo = new Date(today);
        threeDaysAgo.setDate(today.getDate() - 3);

        if (start < threeDaysAgo) {
            throw new BadRequestException('Không được tạo hợp đồng lùi về quá khứ quá 3 ngày!');
        }

        // Tìm Member & Package
        const member = await this.userRepo.findOne({
            where: { userId: memberId, role: Role.MEMBER }
        });
        if (!member) throw new NotFoundException('Không tìm thấy thông tin hội viên.');

        const pkg = await this.packageRepo.findOne({ where: { packageId } });
        if (!pkg) throw new NotFoundException('Không tìm thấy thông tin gói tập.');
        if (pkg.durationDays <= 0) {
            throw new BadRequestException('Cấu hình số ngày của gói tập không hợp lệ!');
        }

        // Logic kiểm tra Seller
        let finalSellerId = sellerId;
        if (pkg.type === PackageType.COACHING) {
            if (!finalSellerId) {
                throw new BadRequestException('Gói Coaching bắt buộc phải chọn Huấn luyện viên phụ trách!');
            }
            if (!pkg.totalSession || pkg.totalSession <= 0) {
                throw new BadRequestException('Gói tập PT này chưa cấu hình tổng số buổi tập!');
            }
        } else {
            finalSellerId = null;
        }

        let seller: User | null = null;
        if (finalSellerId) {
            seller = await this.userRepo.findOne({
                where: {
                    userId: finalSellerId,
                    role: In([Role.COACH, Role.STAFF, Role.ADMIN])
                }
            });
            if (!seller) {
                throw new BadRequestException('Người bán/HLV không tồn tại hoặc không đủ thẩm quyền!');
            }
        }

        // Tính ngày hết hạn & số tiền thực tế
        const end = new Date(start);
        end.setDate(start.getDate() + pkg.durationDays);

        const discountAmount = (Number(pkg.price) * discount) / 100;
        const actualPaid = Number(pkg.price) - discountAmount;

        const newSub = this.subRepo.create({
            member,
            seller,
            package: pkg,
            startDate: start,
            endDate: end,
            remainingSession: pkg.totalSession || 0,
            discount,
            actualPaid,
            paymentMethod,
            status: MemberSubscriptionStatus.ACTIVE
        });

        return await this.subRepo.save(newSub);
    }

    //Lấy danh sách gói tập của hội viên
    async getMemberSubscriptions(currentUserId: string, currentUserRole: Role, queryMemberId?: string) {
        let targetMemberId = currentUserId;

        if (queryMemberId) {
            if ([Role.ADMIN, Role.STAFF, Role.COACH].includes(currentUserRole)) {
                targetMemberId = queryMemberId;
            } else {
                throw new ForbiddenException('Bạn không có quyền xem gói tập của người khác.');
            }
        }

        return await this.subRepo.find({
            where: { member: { userId: targetMemberId } },
            relations: ['package', 'seller'],
            order: { createdAt: 'DESC' }
        });
    }
}