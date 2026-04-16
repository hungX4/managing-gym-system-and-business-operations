import { BookingResponseDto, BookingStatus, CoachType, CreateBookingRequestDto, MemberSubscriptionStatus, Role, UpdateBookingStatusDto } from "@gym/shared";
import { AppDataSource } from "../models/data-source";
import { Booking } from "../models/entity/Booking";
import { User } from "../models/entity/User";
import { MemberSubscription } from "../models/entity/MemberSubscription";
import { MoreThan } from "typeorm";

export class BookingService {
    private bookingRepo = AppDataSource.getRepository(Booking);
    private userRepo = AppDataSource.getRepository(User);
    private subscriptionRepo = AppDataSource.getRepository(MemberSubscription);
    //create booing for coaching 1-1
    create = async (
        dto: CreateBookingRequestDto,
        requesterId: string //id cua pt dat lich
    ): Promise<BookingResponseDto> => {
        //pt chi duoc tao lich cho chinh minh
        if (dto.coachId !== String(requesterId)) {
            throw new Error('FORBIDDEN_NOT_YOUR_BOOKING');
        }

        const coach = await this.userRepo.findOne({
            where: { userId: dto.coachId as any },
            relations: ['coachProfile'],
        })

        if (!coach) throw new Error('COACH_NOT_FOUND')
        if (coach.role !== Role.COACH) throw new Error('USER_IS_NOT_COACH')

        // Coach GYM mới được đặt lịch PT 1-1
        if (
            dto.type === CoachType.GYM &&
            coach.coachProfile?.type !== CoachType.GYM
        ) {
            throw new Error('COACH_TYPE_MISMATCH')
        }

        const member = await this.userRepo.findOne({
            where: { phone: dto.phone as any },//trien khai ca tim bang ten(de sau)
        })

        if (!member) throw new Error('MEMBER_NOT_FOUND');
        if (member.role !== Role.MEMBER) throw new Error('USER_IS_NOT_MEMBER');

        // Kiểm tra trùng lịch của coach trong khoảng thời gian đó
        const conflict = await this.bookingRepo
            .createQueryBuilder('b')
            .where('b.coach_id = :coachId', { coachId: dto.coachId })
            .andWhere('b.status = :status', { status: BookingStatus.CONFIRMED })
            .andWhere('b.start_time < :end AND b.end_time > :start', {
                start: dto.startTime,
                end: dto.endTime,
            })
            .getOne();

        if (conflict) throw new Error('COACH_SCHEDULE_CONFLICT');

        const booking = this.bookingRepo.create({
            coach: coach,
            member: member,
            startTime: dto.startTime,
            endTime: dto.endTime,
            type: dto.type,
            status: BookingStatus.CONFIRMED,
        });
        await this.bookingRepo.save(booking);

        return await this.toResponseDto(booking);
    }

    getList = async (filters: {
        date?: string   // 'YYYY-MM-DD'
        coachId?: number
        memberId?: number
        status?: BookingStatus
    }): Promise<BookingResponseDto[]> => {

        const qb = this.bookingRepo
            .createQueryBuilder('b')
            .leftJoinAndSelect('b.coach', 'coach')
            .leftJoinAndSelect('b.member', 'member')
            .orderBy('b.startTime', 'ASC')

        if (filters.date) {
            qb.andWhere('DATE(b.start_time) = :date', { date: filters.date })
        }
        if (filters.coachId) {
            qb.andWhere('b.coach_id = :coachId', { coachId: filters.coachId })
        }
        if (filters.memberId) {
            qb.andWhere('b.member_id = :memberId', { memberId: filters.memberId })
        }
        if (filters.status) {
            qb.andWhere('b.status = :status', { status: filters.status })
        }

        const bookings = await qb.getMany()
        return await Promise.all(bookings.map(b => this.toResponseDto(b)));
    }

    // ── Lấy chi tiết 1 booking ────────────────────────────────────

    getById = async (bookingId: number): Promise<BookingResponseDto> => {
        const booking = await this.bookingRepo.findOne({
            where: { bookingId },
            relations: ['coach', 'member'],
        })
        if (!booking) throw new Error('BOOKING_NOT_FOUND')
        return await this.toResponseDto(booking)
    }

    // ── Cập nhật status (staff dùng khi checkin) ──────────────────

    updateStatus = async (
        bookingId: number,
        dto: UpdateBookingStatusDto,
    ): Promise<BookingResponseDto> => {
        const booking = await this.bookingRepo.findOne({
            where: { bookingId },
            relations: ['coach', 'member'],
        })
        if (!booking) throw new Error('BOOKING_NOT_FOUND')

        // Chỉ cho phép chuyển từ CONFIRM
        if (booking.status !== BookingStatus.CONFIRMED) {
            throw new Error('BOOKING_ALREADY_PROCESSED')
        }

        const allowedTransitions: BookingStatus[] = [
            BookingStatus.COMPLETED,
            BookingStatus.CANCELLED,
        ]
        if (!allowedTransitions.includes(dto.status)) {
            throw new Error('INVALID_STATUS_TRANSITION')
        }

        booking.status = dto.status
        await this.bookingRepo.save(booking)

        return await this.toResponseDto(booking)
    }

    // ── PT huỷ lịch ───────────────────────────────────────────────

    cancel = async (bookingId: number, requesterId: number): Promise<void> => {
        const booking = await this.bookingRepo.findOne({
            where: { bookingId },
            relations: ['coach'],
        })
        if (!booking) throw new Error('BOOKING_NOT_FOUND')

        // Chỉ PT sở hữu booking mới được huỷ
        if ((booking.coach.userId as unknown as number) !== requesterId) {
            throw new Error('FORBIDDEN_NOT_YOUR_BOOKING')
        }

        if (booking.status !== BookingStatus.CONFIRMED) {
            throw new Error('BOOKING_ALREADY_PROCESSED')
        }

        booking.status = BookingStatus.CANCELLED
        await this.bookingRepo.save(booking)
    }

    //Helper: map entity -> DTO
    private toResponseDto = async (booking: Booking): Promise<BookingResponseDto> => {
        let activeSubscriptionId: number | undefined = undefined;

        if (booking.member) {
            const activeSub = await this.subscriptionRepo.findOne({
                where: {
                    member: { userId: booking.member.userId },
                    status: MemberSubscriptionStatus.ACTIVE,
                    remainingSession: MoreThan(0)
                }
            })

            if (activeSub) {
                activeSubscriptionId = activeSub.subscriptionId;

            }
            // activeSubscriptionId = 1;
        }
        return {
            bookingId: booking.bookingId,
            coachId: booking.coach?.userId as unknown as string,
            coachName: booking.coach?.fullName ?? '',
            memberId: booking.member?.userId as unknown as string,
            memberName: booking.member?.fullName ?? '',
            memberPhone: booking.member?.phone ?? '',
            startTime: booking.startTime,
            endTime: booking.endTime,
            type: booking.type,
            status: booking.status,

            // GẮN THÊM CÁI VỪA TÌM ĐƯỢC VÀO DTO
            subscriptionId: activeSubscriptionId
        }
    }
}    