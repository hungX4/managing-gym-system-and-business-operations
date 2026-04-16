import { WorkLogStatus } from "../enums";

//request
export interface CheckInRequestDto {
    bookingId: number,
    subscriptionId: number | undefined,
    status: WorkLogStatus
}

export interface MemberCheckinRequestDto {
    phone?: string;
    name?: string
}

export interface ClassCheckinRequestDto {
    bookingId: number;
    coachPresent: boolean;
    memberIds?: string[]; // Danh sách ID học viên có mặt
}

//response
export interface CheckInResponseDto {
    message: string; // VD: "Check-in thành công!"

    // Trả về thông tin tóm tắt để Frontend hiển thị thông báo popup cho Lễ tân
    bookingId: number;
    coachName: string;

    // Nếu là PT 1-1, trả về số buổi còn lại để Lễ tân nhắc khách
    memberName?: string;
    remainingSession?: number;

    // Tiền lương PT kiếm được trong ca này (Để PT xem báo cáo trong app của họ)
    earned_amount: number;
}

export interface MemberCheckinResponseDto {
    message: string;
    memberName: string;
    packageName: string;
}

// export interface ClassCheckinResponseDto{

// }