import { MemberSubscriptionStatus, PaymentMethod } from '../enums';

//request
// 1. Luồng khách tự mua Online
export interface BuyPackageOnlineRequestDto {
    // Không cần gửi memberId vì Backend sẽ tự lấy từ Token đăng nhập của khách
    packageId: number;
    voucherCode?: string;
    startDate: Date; // Khách có thể nhập hoặc không
    // (Bảo mật: Không gửi sellerId, không gửi discount %, không gửi actualPaid)
}


// 2. LUỒNG OFFLINE: NHÂN VIÊN TẠO HỢP ĐỒNG (Lễ tân/Sale/Coach/Admin)
// ==========================================
export interface CreateContractRequestDto {
    memberId: string;   // Chọn khách hàng nào
    packageId: number;  // Chọn gói tập nào
    startDate: Date;
    sellerId: string | null;   // Ai là người bán (PT nào, Sale nào)
    discount: number;   // Nhân viên tự nhập % giảm giá chốt với khách (0 nếu không giảm)
    paymentMethod: PaymentMethod; // Bắt buộc chọn phương thức thanh toán
}
//response
export interface SubscriptionResponseDto {
    subscriptionId: number;
    remainingSession: number;
    startDate: Date;
    endDate: Date;
    actualPaid: number;
    status: MemberSubscriptionStatus;
    packageId: number;
    packageName: string;
}