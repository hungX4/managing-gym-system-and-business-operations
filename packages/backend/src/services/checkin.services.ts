// packages/backend/src/services/checkin.services.ts

import { AppDataSource } from "../models/data-source";
import { User } from "../models/entity/User";
import { MemberSubscription } from "../models/entity/MemberSubscription";
import { UsageLog } from "../models/entity/UsageLog";
import { Booking } from "../models/entity/Booking";
import { WorkLog } from "../models/entity/Worklog";
import { BookingStatus, CheckInRequestDto, CheckInResponseDto, MemberSubscriptionStatus, WorkLogStatus } from "@gym/shared";
import { In, MoreThan } from "typeorm";
import { SubscriptionHistoryResponseDto } from "@gym/shared/src/dto/usage.dto";

export class CheckinService {
    private userRepo = AppDataSource.getRepository(User);
    private subRepo = AppDataSource.getRepository(MemberSubscription);
    private usageLogRepo = AppDataSource.getRepository(UsageLog);
    private bookingRepo = AppDataSource.getRepository(Booking);
    private workLogRepo = AppDataSource.getRepository(WorkLog);

    // ── LUỒNG 1: TỰ TẬP (SELF-WORKOUT) ──────────────────────────────
    async selfCheckin(phone: string) {
        // 1. Tìm user theo số điện thoại
        const member = await this.userRepo.findOne({ where: { phone } });
        if (!member) throw new Error('MEMBER_NOT_FOUND');

        // 2. Tìm gói tập đang Active và còn hạn của member này
        const activeSub = await this.subRepo.findOne({
            where: {
                member: { userId: member.userId },
                status: MemberSubscriptionStatus.ACTIVE,
                // Giả định có trường endDate, nếu database bạn dùng cách khác thì điều chỉnh ở đây
                // endDate: MoreThan(new Date()) 
            }
        });

        if (!activeSub) {
            throw new Error('NO_ACTIVE_SUBSCRIPTION'); // Từ chối checkin (400)
        }

        // 3. Hợp lệ -> Ghi nhận UsageLog (workLogId = null)
        const usageLog = this.usageLogRepo.create({
            member: { userId: member.userId },
            subscription: { subscriptionId: activeSub.subscriptionId },
            checkinTime: new Date(),
            workLog: null // Tự tập không có PT -> không có worklog
        });

        await this.usageLogRepo.save(usageLog);

        return {
            message: "Check-in tự tập thành công!",
            memberName: member.fullName,
            checkinTime: usageLog.checkinTime
        };
    }

    // ── LUỒNG 2: DANCE / YOGA CLASS ───────────────────────────────
    async classCheckin(dto: { bookingId: number; coachPresent: boolean; memberIds?: string[] }) {
        const { bookingId, coachPresent, memberIds } = dto;

        // 1. Lấy thông tin lớp học (booking)
        const booking = await this.bookingRepo.findOne({
            where: { bookingId },
            relations: ['coach']
        });

        if (!booking) throw new Error('BOOKING_NOT_FOUND');
        if (booking.status !== BookingStatus.CONFIRMED) {
            throw new Error('BOOKING_ALREADY_PROCESSED');
        }

        // 2. Nhánh vắng mặt (Coach vắng) -> Hủy lớp
        if (!coachPresent) {
            booking.status = BookingStatus.CANCELLED;
            await this.bookingRepo.save(booking);
            return { message: "Ghi nhận Coach vắng mặt, đã huỷ lớp." };
        }

        // 3. Nhánh có mặt (Coach có mặt)
        // 3.1. Insert WorkLog cho Coach (EarnAmount = 250k)
        const workLog = this.workLogRepo.create({
            coach: { userId: booking.coach.userId },
            booking: { bookingId: booking.bookingId },
            earnAmount: 250000, // Hardcode theo diagram (250k)
            checkinTime: new Date(),
            status: WorkLogStatus.COMPLETED
        });
        const savedWorkLog = await this.workLogRepo.save(workLog);

        // 3.2. Có khách tham gia -> Insert UsageLog cho từng khách
        if (memberIds && memberIds.length > 0) {
            // Lấy ra các gói tập active của nhóm khách này
            const activeSubs = await this.subRepo.find({
                where: {
                    member: { userId: In(memberIds) },
                    status: MemberSubscriptionStatus.ACTIVE
                },
                relations: ['member']
            });

            // Lặp và tạo UsageLog
            const usageLogs = activeSubs.map(sub => {
                return this.usageLogRepo.create({
                    member: { userId: sub.member.userId },
                    subscription: { subscriptionId: sub.subscriptionId },
                    checkinTime: new Date(),
                    workLog: { workLogId: savedWorkLog.workLogId } // Liên kết với lớp này
                });
            });

            if (usageLogs.length > 0) {
                await this.usageLogRepo.save(usageLogs);
            }
        }

        // 3.3. Update Booking thành COMPLETED
        booking.status = BookingStatus.COMPLETED;
        await this.bookingRepo.save(booking);

        return {
            message: "Xác nhận lớp thành công!",
            coachEarned: 250000
        };
    }

    // ── LUỒNG 3: PT 1-1 (COMPLETED & LATE CANCEL) ──────────────────────
    async ptCheckin(dto: CheckInRequestDto): Promise<CheckInResponseDto> {
        const { bookingId, subscriptionId, status } = dto;

        // 1. Lấy thông tin Booking
        const booking = await this.bookingRepo.findOne({
            where: { bookingId },
            relations: ['coach', 'member']
        });
        if (!booking) throw new Error('BOOKING_NOT_FOUND');
        if (booking.status !== BookingStatus.CONFIRMED) throw new Error('BOOKING_ALREADY_PROCESSED');

        // 2. Lấy thông tin Gói tập (kèm Package)
        const subscription = await this.subRepo.findOne({
            where: { subscriptionId },
            relations: ['member', 'package']
        });

        if (!subscription || !subscription.package) {
            throw new Error('SUBSCRIPTION_OR_PACKAGE_NOT_FOUND');
        }

        if (subscription.remainingSession <= 0) {
            throw new Error('NO_REMAINING_SESSION');
        }

        // 3. Tính giá trị thực của 1 buổi tập (Lấy totalSession từ Package)
        const totalSessionInPackage = subscription.package.totalSession;
        const sessionValue = Number(subscription.actualPaid) / Number(totalSessionInPackage);

        // 4. Transaction xử lý dữ liệu
        return await AppDataSource.transaction(async (transactionalEntityManager) => {

            // 4.1. Trừ 1 buổi của khách (Áp dụng cho cả CÓ MẶT và LATE CANCEL)
            subscription.remainingSession -= 1;
            await transactionalEntityManager.save(subscription);

            // 4.2. Tạo WorkLog cho PT (Ghi nhận lương ca này)
            const workLog = this.workLogRepo.create({
                coach: { userId: booking.coach.userId },
                booking: { bookingId: booking.bookingId },
                earnAmount: sessionValue,
                checkinTime: new Date(),
                status: status // Sẽ nhận WorkLogStatus.COMPLETED hoặc LATE_CANCEL
            });
            const savedWorkLog = await transactionalEntityManager.save(workLog);

            // 4.3. LUÔN LUÔN tạo UsageLog để làm bằng chứng trừ buổi của khách
            const usageLog = this.usageLogRepo.create({
                member: { userId: booking.member.userId },
                subscription: { subscriptionId: subscription.subscriptionId },
                checkinTime: new Date(),
                workLog: { workLogId: savedWorkLog.workLogId }
            });
            await transactionalEntityManager.save(usageLog);

            // 4.4. Đổi trạng thái Booking tương ứng
            if (status === WorkLogStatus.COMPLETED) {
                booking.status = BookingStatus.COMPLETED;
            } else if (status === WorkLogStatus.LATE_CANCEL) {
                booking.status = BookingStatus.CANCELLED;
            } else {
                throw new Error('INVALID_STATUS_TRANSITION');
            }
            await transactionalEntityManager.save(booking);

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
    //get usage_log Lưu ý việc sử dụng leftJoinAndSelect để lấy thông tin PT từ bảng WorkLog.
    async getSubscriptionHistory(subscriptionId: number): Promise<SubscriptionHistoryResponseDto[]> {
        const logs = await this.usageLogRepo.find({
            where: { subscription: { subscriptionId } },
            relations: ['workLog', 'workLog.coach', 'subscription', 'subscription.package'],
            order: { checkinTime: 'DESC' } // Mới nhất hiện lên đầu
        });

        return logs.map(log => {
            const hasWorkLog = !!log.workLog;

            // Xác định trạng thái dựa trên WorkLog (nếu có)
            let status = 'CHECKIN';
            let note = 'Tự tập / Check-in vào cửa';

            if (hasWorkLog) {
                status = log.workLog!.status;
                note = status === WorkLogStatus.COMPLETED
                    ? `Tập cùng PT ${log.workLog?.coach.fullName}`
                    : `Trừ buổi do Late Cancel (PT: ${log.workLog?.coach.fullName})`;
            }

            return {
                usageLogId: log.usageLogId,
                checkinTime: log.checkinTime,
                packageName: log.subscription.package.name,
                coachName: log.workLog?.coach.fullName,
                status: status,
                note: note
            };
        });
    }
}