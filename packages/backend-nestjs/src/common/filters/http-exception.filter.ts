import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

// 🟢 Từ điển ánh xạ Mã lỗi tiếng Anh sang Tiếng Việt
const ERROR_DICTIONARY: Record<string, string> = {
    // Checkin / Booking Errors
    'BOOKING_NOT_FOUND': 'Không tìm thấy lịch hẹn.',
    'BOOKING_ALREADY_PROCESSED': 'Lịch hẹn này đã được xử lý trước đó.',
    'SUBSCRIPTION_OR_PACKAGE_NOT_FOUND': 'Không tìm thấy thông tin gói tập của hội viên.',
    'NO_REMAINING_SESSION': 'Gói tập đã hết số buổi sử dụng.',
    'INVALID_STATUS_TRANSITION': 'Trạng thái chuyển đổi không hợp lệ.',
    'MEMBER_NOT_FOUND_OR_NO_ACTIVE_SUBSCRIPTION': 'Hội viên không tồn tại hoặc không có gói tập đang active.',

    // Auth & Token Errors
    'PHONE_NUMBER_ALREADY_IN_USE': 'Số điện thoại này đã được đăng ký sử dụng.',
    'INVALID_CREDENTIALS': 'Số điện thoại hoặc mật khẩu không chính xác.',
    'INVALID_REFRESH_TOKEN': 'Phiên đăng nhập không hợp lệ hoặc đã bị vô hiệu hóa.',
    'REFRESH_TOKEN_REUSE_DETECTED': 'Cảnh báo an ninh: Phát hiện hành vi sử dụng lại token cũ. Vui lòng đăng nhập lại.',
    'REFRESH_TOKEN_EXPIRED': 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.',

    // Attendance Errors
    'MISSING_USER_ID': 'Vui lòng cung cấp mã hội viên (userId).',
    'MISSING_DATE_PARAMETER': 'Vui lòng chọn ngày cần xem nhật ký điểm danh.',

    // Subscription / Package Errors
    'MEMBER_NOT_FOUND': 'Không tìm thấy thông tin hội viên.',
    'PACKAGE_NOT_FOUND': 'Không tìm thấy thông tin gói tập.',
    'SELLER_NOT_QUALIFIED': 'Nhân sự chọn không đủ thẩm quyền hoặc không tồn tại.',
    'COACHING_REQUIRE_SELLER': 'Gói Coaching bắt buộc phải chỉ định Huấn luyện viên phụ trách.',

    // Online Payment Errors
    'INVALID_PACKAGE_FOR_ONLINE_PAYMENT': 'Gói tập không tồn tại hoặc không hỗ trợ thanh toán online.',
    'VNPAY_CONFIG_MISSING': 'Hệ thống thanh toán VNPAY chưa được cấu hình. Vui lòng liên hệ quản trị viên.',

    // Revenue / Admin Errors
    'INVALID_MONTH': 'Tháng không hợp lệ (chỉ chấp nhận từ tháng 1 đến 12).',
    'INVALID_YEAR': 'Năm không hợp lệ.',
    'REVENUE_DATA_NOT_FOUND': 'Không tìm thấy dữ liệu thống kê doanh thu cho thời gian này.',

    // Trial Lead Errors
    'LEAD_NOT_FOUND': 'Không tìm thấy thông tin khách hàng dùng thử.',
    'STAFF_NOT_FOUND': 'Không tìm thấy thông tin nhân viên được chỉ định.',
};

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const status = exception.getStatus();
        const exceptionResponse = exception.getResponse() as any;

        // Lấy message nguyên bản từ Service
        const rawMessage = typeof exceptionResponse === 'object'
            ? exceptionResponse.message
            : exceptionResponse;

        // Dịch message sang Tiếng Việt nếu tìm thấy trong Dictionary
        let translatedMessage = rawMessage;

        if (typeof rawMessage === 'string') {
            translatedMessage = ERROR_DICTIONARY[rawMessage] || rawMessage;
        } else if (Array.isArray(rawMessage)) {
            // Trường hợp lỗi từ Class-Validator (trả về mảng string)
            translatedMessage = rawMessage.map(msg => ERROR_DICTIONARY[msg] || msg);
        }

        response.status(status).json({
            statusCode: status,
            message: translatedMessage,
            timestamp: new Date().toISOString(),
        });
    }
}