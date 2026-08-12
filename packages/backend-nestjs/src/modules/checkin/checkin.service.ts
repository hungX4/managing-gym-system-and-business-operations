import { BookingStatus, CheckInRequestDto, CheckInResponseDto, MemberSubscriptionStatus, PackageType, PaginatedResponseDto, SubscriptionHistoryResponseDto, UsageLogStatus, WorkLogStatus, } from "@gym/shared";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectDataSource, InjectRepository } from "@nestjs/typeorm";
import { Between, DataSource, MoreThan, Repository } from "typeorm";
import { MemberSubscription } from "../subscription/entities/member-subscription.entity";
import { Booking } from "../booking/entities/booking.entity";
import { UsageLog } from "../attendance/entities/usage-log.entity";
import { WorkLog } from "../attendance/entities/work-log.entity";
import { formatLocalDateTime } from "src/common/utils/time.util";

@Injectable()
export class CheckinService {
    constructor(
        @InjectDataSource()
        private dataSource: DataSource,

        @InjectRepository(Booking)
        private bookingRepo: Repository<Booking>,

        @InjectRepository(UsageLog)
        private readonly usageLogRepo: Repository<UsageLog>,

        @InjectRepository(MemberSubscription)
        private readonly subRepo: Repository<MemberSubscription>,
    ) { }

    async selfCheckin(memberId: string) {
        // Phi thẳng vào bảng Subscription, join với Member để lấy tên
        const activeSub = await this.subRepo.findOne({
            where: {
                member: { userId: memberId as any },
                status: MemberSubscriptionStatus.ACTIVE,
                endDate: MoreThan(new Date()),
                package: {
                    type: PackageType.MEMBERSHIP
                }
            },
            relations: ['member'] // Join để lấy thông tin member
        });

        if (!activeSub) {
            throw new BadRequestException('MEMBER_NOT_FOUND_OR_NO_ACTIVE_SUBSCRIPTION');
        }

        const usageLog = this.usageLogRepo.create({
            member: { userId: activeSub.member.userId },
            subscription: { subscriptionId: activeSub.subscriptionId },
            checkinTime: new Date(),
            workLog: null
        });

        await this.usageLogRepo.save(usageLog);

        return {
            message: "Check-in tự tập thành công!",
            memberName: activeSub.member.fullName,
            checkinTime: formatLocalDateTime(usageLog.checkinTime)
        };
    }

    async markBookingAsCompleted(dto: CheckInRequestDto): Promise<CheckInResponseDto> {
        const { bookingId, subscriptionId, status } = dto;

        return await this.dataSource.transaction(async (manager) => {
            const booking = await this.bookingRepo.findOne({
                where: { bookingId },
                relations: ['coach', 'member']
            })

            if (!booking) throw new NotFoundException('BOOKING_NOT_FOUND');
            if (booking.status !== BookingStatus.CONFIRMED) {
                throw new BadRequestException('BOOKING_ALREADY_PROCESSED');
            }

            //fix race condition
            const subscription = await manager.findOne(MemberSubscription, {
                where: { subscriptionId },
                relations: ['member', 'package'],
                lock: { mode: 'pessimistic_write' }
            })

            if (!subscription || !subscription.package) {
                throw new NotFoundException('SUBSCRIPTION_OR_PACKAGE_NOT_FOUND');
            }

            if (subscription.remainingSession <= 0) {
                throw new BadRequestException('NO_REMAINING_SESSION');
            }

            // FIX DIVISION BY ZERO
            const totalSessionInPackage = Number(subscription.package.totalSession) || 1;
            const sessionValue = totalSessionInPackage > 0
                ? Number(subscription.actualPaid) / totalSessionInPackage
                : 0;

            subscription.remainingSession -= 1;
            await manager.save(subscription);

            const workLog = manager.create(WorkLog, {
                coach: { userId: booking.coach.userId },
                booking: { bookingId: booking.bookingId },
                earnAmount: sessionValue,
                checkinTime: new Date(),
                status: status
            });
            const savedWorkLog = await manager.save(workLog);

            const usageLog = manager.create(UsageLog, {
                member: { userId: booking.member.userId },
                subscription: { subscriptionId: subscription.subscriptionId },
                checkinTime: new Date(),
                workLog: { workLogId: savedWorkLog.workLogId }
            });
            await manager.save(usageLog);

            if (status === WorkLogStatus.COMPLETED) {
                booking.status = BookingStatus.COMPLETED;
            } else if (status === WorkLogStatus.LATE_CANCEL) {
                booking.status = BookingStatus.CANCELLED;
            } else {
                throw new BadRequestException('INVALID_STATUS_TRANSITION');
            }
            await manager.save(booking);

            return {
                message: status === WorkLogStatus.COMPLETED
                    ? "Check-in PT thành công!"
                    : "Ghi nhận Late Cancel: Đã trừ buổi và tính lương PT!",
                bookingId: booking.bookingId,
                coachName: booking.coach.fullName,
                memberName: booking.member.fullName,
                remainingSession: subscription.remainingSession,
                earned_amount: sessionValue
            };
        });
    }

    //get history by subscription
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
                checkinTime: formatLocalDateTime(log.checkinTime),
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

    // LẤY LOG THEO NGÀY ────────────────────────────────
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