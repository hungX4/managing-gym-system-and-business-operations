import { AppDataSource } from "../models/data-source";
import { MemberSubscription } from "../models/entity/MemberSubscription";
import { Package } from "../models/entity/Package";
import { User } from "../models/entity/User";
import { Voucher } from "../models/entity/Voucher"; // Nếu bạn có file này
import {
    BuyPackageOnlineRequestDto,
    CreateContractRequestDto,
    PackageType,
    MemberSubscriptionStatus,
    Role
} from "@gym/shared";
import { In } from 'typeorm';
export class MemberSubscriptionService {
    private subRepo = AppDataSource.getRepository(MemberSubscription);
    private packageRepo = AppDataSource.getRepository(Package);
    private userRepo = AppDataSource.getRepository(User);
    private voucherRepo = AppDataSource.getRepository(Voucher); // Mở comment nếu dùng Voucher


    // 1. LUỒNG OFFLINE: NHÂN VIÊN TẠO HỢP ĐỒNG (Lễ tân/Sale/Coach)



    // ...

    async createContract(dto: CreateContractRequestDto) {
        const { memberId, packageId, sellerId, startDate, discount, paymentMethod } = dto;


        // 1. VALIDATE BẢO MẬT & DỮ LIỆU ĐẦU VÀO


        // Check discount hợp lệ
        if (discount < 0 || discount > 100) {
            throw new Error('Mức giảm giá không hợp lệ! Chỉ được từ 0% đến 100%');
        }

        // Check ngày tháng hợp lệ
        const start = new Date(startDate);
        if (isNaN(start.getTime())) {
            throw new Error('Ngày bắt đầu không hợp lệ!');
        }

        // Đảm bảo không tạo hợp đồng lùi về quá khứ xa (Ví dụ: chặn lùi quá 3 ngày)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const threeDaysAgo = new Date(today);
        threeDaysAgo.setDate(today.getDate() - 3);
        if (start < threeDaysAgo) {
            throw new Error('Không được tạo hợp đồng lùi về quá khứ quá 3 ngày!');
        }


        // 2. TÌM KIẾM THỰC THỂ TỪ DB

        const member = await this.userRepo.findOne({ where: { userId: memberId, role: Role.MEMBER } });
        if (!member) throw new Error('Không tìm thấy hội viên (MEMBER_NOT_FOUND)');

        const pkg = await this.packageRepo.findOne({ where: { packageId } });
        if (!pkg) throw new Error('Không tìm thấy gói tập (PACKAGE_NOT_FOUND)');

        if (pkg.durationDays <= 0) {
            throw new Error('Cấu hình số ngày của gói tập không hợp lệ!');
        }


        // 3. LOGIC KIỂM TRA CHÉO LOẠI GÓI VÀ NGƯỜI BÁN
        let finalSellerId = sellerId;

        if (pkg.type === PackageType.COACHING) {
            if (!finalSellerId) {
                throw new Error('Gói Coaching bắt buộc phải chỉ định Huấn luyện viên phụ trách!');
            }
            if (!pkg.totalSession || pkg.totalSession <= 0) {
                throw new Error('Gói tập PT này chưa được cấu hình tổng số buổi tập hợp lệ!');
            }
        } else {
            // Ép về null nếu là MEMBERSHIP
            finalSellerId = null;
        }


        // 4. KIỂM TRA SELLER CÓ THỰC SỰ LÀ NHÂN VIÊN/PT KHÔNG?

        let seller = null;
        if (finalSellerId) {
            seller = await this.userRepo.findOne({
                where: {
                    userId: finalSellerId,
                    // CHỐNG HACK: Chỉ nhân sự mới được làm seller, MEMBER không được phép
                    role: In([Role.COACH, Role.STAFF, Role.ADMIN])
                }
            });
            if (!seller) throw new Error('Nhân sự không tồn tại hoặc người dùng không có quyền Huấn luyện viên!');
        }


        // 5. TÍNH TOÁN TOÁN HỌC & LƯU DB

        const end = new Date(start);
        end.setDate(start.getDate() + pkg.durationDays);

        const discountAmount = (Number(pkg.price) * discount) / 100;
        const actualPaid = Number(pkg.price) - discountAmount;

        const newSub = this.subRepo.create({
            member: member,
            seller: seller,
            package: pkg,
            startDate: start,
            endDate: end,
            remainingSession: pkg.totalSession || 0,
            discount: discount,
            actualPaid: actualPaid,
            paymentMethod: paymentMethod,
            status: MemberSubscriptionStatus.ACTIVE
        });

        return await this.subRepo.save(newSub);
    }
    // 2. LUỒNG ONLINE: KHÁCH HÀNG TỰ MUA TRÊN WEB
    async buyOnline(memberId: string, dto: BuyPackageOnlineRequestDto) {
        const { packageId, startDate, voucherCode } = dto;

        const member = await this.userRepo.findOne({ where: { userId: memberId } });
        if (!member) throw new Error('Không tìm thấy thông tin hội viên');

        const pkg = await this.packageRepo.findOne({ where: { packageId } });
        if (!pkg) throw new Error('Không tìm thấy gói tập');


        //LOGIC CHECK LOẠI GÓI TẬP (ONLINE)
        if (pkg.type !== PackageType.MEMBERSHIP) {
            throw new Error('Lỗi: Bạn chỉ có thể tự mua gói Hội viên (MEMBERSHIP) qua kênh Online. Với gói PT/Dance, vui lòng liên hệ quầy dịch vụ.');
        }

        // =========================================

        let finalDiscountPercent = 0;
        let appliedVoucherStr = null;

        // Xử lý Voucher (nếu có dùng bảng Voucher)
        /* if (voucherCode) {
            const voucher = await this.voucherRepo.findOne({ where: { code: voucherCode, isActive: true } });
            if (!voucher) throw new Error('Mã giảm giá không hợp lệ hoặc đã hết hạn');
            if (voucher.usageLimit > 0 && voucher.usedCount >= voucher.usageLimit) {
                throw new Error('Mã giảm giá đã hết lượt sử dụng');
            }
            voucher.usedCount += 1;
            await this.voucherRepo.save(voucher);
            finalDiscountPercent = voucher.discountPercentage;
            appliedVoucherStr = voucher.code;
        }
        */

        const start = new Date(startDate);
        const end = new Date(start);
        end.setDate(start.getDate() + pkg.durationDays);

        const discountAmount = (Number(pkg.price) * finalDiscountPercent) / 100;
        const actualPaid = Number(pkg.price) - discountAmount;

        const newSub = this.subRepo.create({
            member: member,
            seller: null,
            package: pkg,
            startDate: start,
            endDate: end,
            remainingSession: pkg.totalSession || 0,
            discount: finalDiscountPercent,
            actualPaid: actualPaid,
            appliedVoucherCode: appliedVoucherStr,
            status: MemberSubscriptionStatus.ACTIVE
        });

        return await this.subRepo.save(newSub);
    }

    // 3. Lấy lịch sử gói tập của 1 hội viên
    async getMemberSubscriptions(memberId: string) {
        const subscriptions = await this.subRepo.find({
            where: { member: { userId: memberId } },
            relations: ['package', 'seller'], //Lấy thông tin gói tập và người bán -> để tự xem package và ai coach??
            order: { createdAt: 'DESC' }       //Gói mới mua lên đầu
        });

        return subscriptions;
    }
}