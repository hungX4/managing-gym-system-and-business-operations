import { format } from 'date-fns';
import * as crypto from 'crypto';
import * as qs from 'qs';
import { AppDataSource } from '../models/data-source';
import { Package } from '../models/entity/Package';
import { BuyPackageOnlineRequestDto, MemberSubscriptionStatus, PackageType, PaymentMethod } from '@gym/shared';
import { MemberSubscription } from '../models/entity/MemberSubscription';
import { VNPAY_CONFIG } from '../config/vnpay.config';

export class OnlinePaymentService {
    private pkgRepo = AppDataSource.getRepository(Package);
    private subRepo = AppDataSource.getRepository(MemberSubscription);
    async createVnpayUrl(userId: number, dto: BuyPackageOnlineRequestDto, ipAddress: string) {
        // 1. Kiểm tra gói tập MEMBERSHIP
        const pkg = await this.pkgRepo.findOneBy({
            packageId: dto.packageId,
            isActive: true,
            type: PackageType.MEMBERSHIP
        });
        if (!pkg) throw new Error("Gói tập không tồn tại hoặc không hỗ trợ mua online.");

        // 2. Tính toán ngày
        const startDate = dto.startDate ? new Date(dto.startDate) : new Date();
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + pkg.durationDays);

        // 3. Tạo subscription tạm thời trong DB voi trang thai pending
        const newSub = this.subRepo.create({
            member: { userId } as any,
            package: pkg,
            startDate,
            endDate,
            remainingSession: pkg.totalSession || 0,
            actualPaid: pkg.price,
            paymentMethod: PaymentMethod.BANK_TRANSFER, // Enum bạn tự định nghĩa thêm
            status: MemberSubscriptionStatus.PENDING,
        });
        const savedSub = await this.subRepo.save(newSub);

        // 4. Cấu hình tham số VNPAY
        const date = new Date();
        const createDate = format(date, 'yyyyMMddHHmmss');
        const tmnCode = VNPAY_CONFIG.vnp_TmnCode;
        const secretKey = VNPAY_CONFIG.vnp_HashSecret;
        let vnpUrl = VNPAY_CONFIG.vnp_Url;

        const vnp_Params: any = {
            'vnp_Version': '2.1.0',
            'vnp_Command': 'pay',
            'vnp_TmnCode': tmnCode,
            'vnp_Locale': 'vn',
            'vnp_CurrCode': 'VND',
            'vnp_TxnRef': savedSub.subscriptionId.toString(), // Dùng ID đơn hàng làm mã giao dịch
            'vnp_OrderInfo': `Thanh toan goi tap ${pkg.name}`,
            'vnp_OrderType': 'other',
            'vnp_Amount': Math.round(Number(pkg.price) * 100), // VNPAY tính theo đơn vị xu (nhân 100)
            'vnp_ReturnUrl': VNPAY_CONFIG.vnp_ReturnUrl,
            'vnp_IpAddr': ipAddress,
            'vnp_CreateDate': createDate,
        };

        // 5. Sắp xếp và Tạo chữ ký bảo mật (Checksum)
        const sortedParams = this.sortObject(vnp_Params);
        const signData = qs.stringify(sortedParams, { encode: false });
        const hmac = crypto.createHmac("sha512", secretKey);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

        vnp_Params['vnp_SecureHash'] = signed;
        vnpUrl += '?' + qs.stringify(vnp_Params, { encode: false });

        return vnpUrl;
    }

    // LOGIC 2: Xử lý IPN (Xác thực và cập nhật trạng thái)
    async processVnpayIpn(vnp_Params: any) {
        const secureHash = vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHashType'];

        // 1. Kiểm tra chữ ký
        const signed = this.calculateHash(vnp_Params);
        if (secureHash !== signed) return { RspCode: '97', Message: 'Invalid Checksum' };

        // 2. Kiểm tra đơn hàng trong DB
        const subId = Number(vnp_Params['vnp_TxnRef']);
        const sub = await this.subRepo.findOne({ where: { subscriptionId: subId } });

        if (!sub) return { RspCode: '01', Message: 'Order not found' };
        if (sub.status !== MemberSubscriptionStatus.PENDING) return { RspCode: '02', Message: 'Already confirmed' };

        // 3. Cập nhật kết quả
        if (vnp_Params['vnp_ResponseCode'] === '00') {
            sub.status = MemberSubscriptionStatus.ACTIVE;
            await this.subRepo.save(sub);
            return { RspCode: '00', Message: 'Success' };
        } else {
            sub.status = MemberSubscriptionStatus.EXPIRATED;
            await this.subRepo.save(sub);
            return { RspCode: '00', Message: 'Payment Failed' };
        }
    }

    // --- Các hàm Helper xử lý thuật toán ký ---
    private generateSignedUrl(params: any) {
        const sorted = this.sortObject(params);
        const signData = qs.stringify(sorted, { encode: false });
        const signed = this.calculateHash(params);
        params['vnp_SecureHash'] = signed;
        return VNPAY_CONFIG.vnp_Url + '?' + qs.stringify(params, { encode: false });
    }

    private calculateHash(params: any) {
        const sorted = this.sortObject(params);
        const signData = qs.stringify(sorted, { encode: false });
        return crypto.createHmac("sha512", VNPAY_CONFIG.vnp_HashSecret)
            .update(Buffer.from(signData, 'utf-8'))
            .digest("hex");
    }

    // Hàm bổ trợ sắp xếp tham số (VNPAY bắt buộc)
    private sortObject(obj: any) {
        let sorted: any = {};

        // Object.keys tự động lấy các thuộc tính thực sự của object mà không cần hasOwnProperty
        let keys = Object.keys(obj).sort();

        for (let i = 0; i < keys.length; i++) {
            let key = keys[i];
            // Encode key và value theo đúng chuẩn VNPAY
            sorted[key] = encodeURIComponent(obj[key]).replace(/%20/g, "+");
        }

        return sorted;
    }
}