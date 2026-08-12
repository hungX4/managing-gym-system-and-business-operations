// packages/shared/src/dtos/usage.dto.ts

import { UsageLogStatus, WorkLogStatus } from "../enums";

export interface SubscriptionHistoryResponseDto {
    usageLogId: number;
    checkinTime: string;
    memberName: string;
    memberPhone: string;
    packageName: string;
    coachName?: string; // Có nếu là tập với PT
    status: UsageLogStatus | WorkLogStatus;     // COMPLETED, LATE_CANCEL hoặc CHECKIN (nếu là tự tập)
}