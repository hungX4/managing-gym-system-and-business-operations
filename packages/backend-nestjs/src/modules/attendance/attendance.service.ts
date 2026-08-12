// src/modules/attendance/attendance.service.ts

import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Between, Repository } from "typeorm";
import { UsageLog } from "./entities/usage-log.entity";
import {
    PaginatedResponseDto,
    SubscriptionHistoryResponseDto,
    UsageLogStatus,
    WorkLogStatus
} from "@gym/shared";
import { formatLocalDateTime } from "src/common/utils/time.util";

@Injectable()
export class AttendanceService {
    constructor(
        @InjectRepository(UsageLog)
        private readonly usageLogRepo: Repository<UsageLog>,
    ) { }

    // LẤY LỊCH SỬ CỦA MỘT HỘI VIÊN (Đã tích hợp phân trang)
    async getUsageLogByUserId(
        userId: string,
        page: number = 1,
        limit: number = 10
    ): Promise<PaginatedResponseDto<SubscriptionHistoryResponseDto>> {
        const skip = (page - 1) * limit;

        const [logs, total] = await this.usageLogRepo.findAndCount({
            where: { member: { userId } },
            relations: ['member', 'workLog', 'workLog.coach', 'subscription', 'subscription.package'],
            order: { checkinTime: 'DESC' },
            take: limit, // Tương đương LIMIT trong SQL
            skip: skip   // Tương đương OFFSET trong SQL
        });

        const data = logs.map(log => {
            const hasWorkLog = !!log.workLog;
            let status: UsageLogStatus | WorkLogStatus = UsageLogStatus.SELFCHECKIN;

            if (hasWorkLog) {
                status = log.workLog!.status === WorkLogStatus.COMPLETED ? UsageLogStatus.COACHCHECKIN : WorkLogStatus.LATE_CANCEL
            }

            return {
                usageLogId: log.usageLogId,
                checkinTime: formatLocalDateTime(log.checkinTime), // Ép định dạng giờ địa phương
                memberName: log.member.fullName,
                memberPhone: log.member.phone,
                packageName: log.subscription.package.name,
                coachName: log.workLog?.coach?.fullName,
                status: status
            };
        });

        return {
            data: data,
            meta: {
                totalItems: total,
                itemCount: data.length,
                itemsPerPage: limit,
                totalPages: Math.ceil(total / limit),
                currentPage: page,
            }
        };
    }

    // LẤY TẤT CẢ LOG THEO NGÀY
    async getLogsByDate(dateString: string): Promise<SubscriptionHistoryResponseDto[]> {
        const startOfDay = new Date(`${dateString}T00:00:00.000Z`);
        const endOfDay = new Date(`${dateString}T23:59:59.999Z`);

        const logs = await this.usageLogRepo.find({
            where: {
                checkinTime: Between(startOfDay, endOfDay),
            },
            relations: ['member', 'subscription', 'subscription.package', 'workLog', 'workLog.coach'],
            order: { checkinTime: 'DESC' }
        });

        return logs.map(log => {
            const hasWorkLog = !!log.workLog;
            let type: UsageLogStatus = UsageLogStatus.SELFCHECKIN;
            let coachName: string | undefined;

            if (hasWorkLog) {
                type = UsageLogStatus.COACHCHECKIN
                coachName = log.workLog?.coach?.fullName;
            }

            return {
                usageLogId: log.usageLogId,
                checkinTime: formatLocalDateTime(log.checkinTime),
                memberName: log.member.fullName,
                memberPhone: log.member.phone,
                packageName: log.subscription.package.name,
                coachName: coachName,
                status: type
            };
        });
    }
}