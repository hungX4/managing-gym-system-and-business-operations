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

    // Auth / System Errors
    'UNAUTHORIZED': 'Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn.',
    'FORBIDDEN': 'Bạn không có quyền thực hiện thao tác này.',
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