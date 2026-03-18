import { WorkLogStatus } from "../enums";

//request
export interface CheckInRequestDto {
    bookingId: number,
    subscriptionId: number,
    status: WorkLogStatus
}


//response
export interface CheckInResponseDto {
    message: string; // VD: "Check-in thành công!"

    // Trả về thông tin tóm tắt để Frontend hiển thị thông báo popup cho Lễ tân
    booking_id: number;
    coach_name: string;

    // Nếu là PT 1-1, trả về số buổi còn lại để Lễ tân nhắc khách
    member_name?: string;
    remaining_session?: number;

    // Tiền lương PT kiếm được trong ca này (Để PT xem báo cáo trong app của họ)
    earned_amount: number;
}