import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { format } from 'date-fns';
import * as crypto from 'crypto';
import * as qs from 'qs';
import { MemberSubscription } from '../subscription/entities/member-subscription.entity';
import { Package } from '../subscription/entities/package.entity';
import { BuyPackageOnlineRequestDto, MemberSubscriptionStatus, PackageType, PaymentMethod } from '@gym/shared';

@Injectable()
export class OnlinePaymentService {
    constructor(
        @InjectRepository(Package)
        private readonly pkgRepo: Repository<Package>,
        @InjectRepository(MemberSubscription)
        private readonly subRepo: Repository<MemberSubscription>,
        private readonly configService: ConfigService,
    ) { }

    async createVnpayUrl(userId: string, dto: BuyPackageOnlineRequestDto, ipAddress: string) {
        // 1. Kiểm tra gói tập MEMBERSHIP
        const pkg = await this.pkgRepo.findOneBy({
            packageId: dto.packageId,
            isActive: true,
            type: PackageType.MEMBERSHIP,
        });
        if (!pkg) {
            throw new BadRequestException('Gói tập không tồn tại hoặc không hỗ trợ mua online.');
        }

        // 2. Tính toán ngày
        const startDate = dto.startDate ? new Date(dto.startDate) : new Date();
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + pkg.durationDays);

        // Lấy số buổi tập (hỗ trợ cả totalSessions và totalSession)
        const totalSessions = (pkg as any).totalSessions ?? (pkg as any).totalSession ?? 0;

        // 3. Tạo subscription tạm thời trong DB (PENDING)
        const newSub = this.subRepo.create({
            memberId: userId,
            package: pkg,
            startDate,
            endDate,
            remainingSession: totalSessions,
            actualPaid: pkg.price,
            paymentMethod: PaymentMethod.BANK_TRANSFER,
            status: MemberSubscriptionStatus.PENDING,
        });
        const savedSub = await this.subRepo.save(newSub);

        // 4. Cấu hình tham số VNPAY
        const date = new Date();
        const createDate = format(date, 'yyyyMMddHHmmss');
        const tmnCode = this.configService.get<string>('VNP_TMN_CODE');
        const secretKey = this.configService.get<string>('VNP_HASH_SECRET');
        const vnpUrl = this.configService.get<string>(
            'VNP_URL',
            'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
        );
        const returnUrl = this.configService.get<string>(
            'VNP_RETURN_URL',
            'http://localhost:5173/payment-success',
        );

        if (!tmnCode || !secretKey) {
            throw new InternalServerErrorException('Chưa cấu hình VNP_TMN_CODE hoặc VNP_HASH_SECRET trong file .env');
        }

        const vnp_Params: Record<string, any> = {
            vnp_Version: '2.1.0',
            vnp_Command: 'pay',
            vnp_TmnCode: tmnCode,
            vnp_Locale: 'vn',
            vnp_CurrCode: 'VND',
            vnp_TxnRef: savedSub.subscriptionId.toString(),
            vnp_OrderInfo: `Thanh toan goi tap ${pkg.name}`,
            vnp_OrderType: 'other',
            vnp_Amount: Math.round(Number(pkg.price) * 100),
            vnp_ReturnUrl: returnUrl,
            vnp_IpAddr: ipAddress,
            vnp_CreateDate: createDate,
        };

        // 5. Sắp xếp và Tạo chữ ký bảo mật (Checksum)
        const sortedParams = this.sortObject(vnp_Params);
        const signData = qs.stringify(sortedParams, { encode: false });
        const hmac = crypto.createHmac('sha512', secretKey);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

        vnp_Params['vnp_SecureHash'] = signed;
        return `${vnpUrl}?${qs.stringify(vnp_Params, { encode: false })}`;
    }

    // Xử lý IPN (Xác thực và cập nhật trạng thái)
    async processVnpayIpn(vnp_Params: any) {
        const params = { ...vnp_Params };
        const secureHash = params['vnp_SecureHash'];
        delete params['vnp_SecureHash'];
        delete params['vnp_SecureHashType'];

        // 1. Kiểm tra chữ ký
        const signed = this.calculateHash(params);
        if (secureHash !== signed) {
            return { RspCode: '97', Message: 'Invalid Checksum' };
        }

        // 2. Kiểm tra đơn hàng trong DB
        const subId = Number(params['vnp_TxnRef']);
        if (isNaN(subId)) {
            return { RspCode: '01', Message: 'Order not found' };
        }

        const sub = await this.subRepo.findOne({ where: { subscriptionId: subId } });

        if (!sub) return { RspCode: '01', Message: 'Order not found' };
        if (sub.status !== MemberSubscriptionStatus.PENDING) {
            return { RspCode: '02', Message: 'Order already confirmed' };
        }

        // 3. Cập nhật kết quả (Dùng update() trực tiếp thay save() để tránh UpdateValuesMissingError)
        if (params['vnp_ResponseCode'] === '00') {
            await this.subRepo.update(
                { subscriptionId: subId },
                { status: MemberSubscriptionStatus.ACTIVE }
            );
            return { RspCode: '00', Message: 'Success' };
        } else {
            await this.subRepo.update(
                { subscriptionId: subId },
                { status: MemberSubscriptionStatus.CANCELLED }
            );
            return { RspCode: '00', Message: 'Confirm Success' };
        }
    }

    // --- Helpers ---
    private calculateHash(params: any) {
        const secretKey = this.configService.get<string>('VNP_HASH_SECRET') || '';
        const sorted = this.sortObject(params);
        const signData = qs.stringify(sorted, { encode: false });
        return crypto
            .createHmac('sha512', secretKey)
            .update(Buffer.from(signData, 'utf-8'))
            .digest('hex');
    }

    // Lọc tham số rỗng và mã hóa đúng chuẩn VNPAY
    private sortObject(obj: any) {
        const sorted: Record<string, any> = {};
        const keys = Object.keys(obj).sort();

        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const value = obj[key];
            // Bắt buộc loại bỏ null, undefined và chuỗi rỗng khi tạo Checksum
            if (value !== null && value !== undefined && value !== '') {
                sorted[key] = encodeURIComponent(value).replace(/%20/g, '+');
            }
        }
        return sorted;
    }
}