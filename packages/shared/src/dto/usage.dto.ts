// packages/shared/src/dtos/usage.dto.ts

export interface SubscriptionHistoryResponseDto {
    usageLogId: number;
    checkinTime: Date;
    packageName: string;
    coachName?: string; // Có nếu là tập với PT
    status: string;     // COMPLETED, LATE_CANCEL hoặc CHECKIN (nếu là tự tập)
    note: string;       // "Tập cùng PT", "Khách hủy muộn", "Tự tập"...
}