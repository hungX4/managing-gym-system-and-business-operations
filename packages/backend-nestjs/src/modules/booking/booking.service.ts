import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Booking } from "./entities/booking.entity";
import { MoreThan, Repository } from "typeorm";
import { UserService } from "../user/services/user.service";
import { BookingResponseDto, BookingStatus, CoachType, CreateBookingRequestDto, MemberSubscriptionStatus, UpdateBookingStatusDto } from "@gym/shared";
import { MemberSubscription } from "../subscription/entities/member-subscription.entity";

@Injectable()
export class BookingService {
    constructor(
        @InjectRepository(Booking)
        private readonly bookingRepo: Repository<Booking>,

        @InjectRepository(MemberSubscription)
        private readonly memberSubRepo: Repository<MemberSubscription>,

        private readonly userService: UserService
    ) { }

    async createNewBooking(
        dto: CreateBookingRequestDto,
        requesterId: string
    ): Promise<BookingResponseDto> {
        //console.log(typeof requesterId, "-", typeof dto.coachId)
        //coach only can create booking schedule for himself
        if (dto.coachId !== requesterId) {
            throw new ForbiddenException('FORBIDDEN_NOT_YOUR_BOOKING!');
        }

        const coach = await this.userService.getCoachProfile(dto.coachId);

        if (dto.type === CoachType.GYM && coach.coachType !== CoachType.GYM) {
            throw new BadRequestException('COACH_TYPE_MISMATCH');
        }

        const member = await this.userService.getUserById(dto.memberId);

        //check conflict schedule
        const conflict = await this.bookingRepo
            .createQueryBuilder('b')
            .where('b.coach_id = :coachId', { coachId: dto.coachId })
            .andWhere('b.status = :status', { status: BookingStatus.CONFIRMED })
            .andWhere('b.start_time < :end AND b.end_time > :start', {
                start: dto.startTime,
                end: dto.endTime,
            })
            .getOne();

        if (conflict) {
            throw new ConflictException('COACH_SCHEDULE_CONFLICT');// 409 Conflict
        }

        const booking = this.bookingRepo.create({
            coach: {
                userId: coach.userId
            },
            member: member,
            startTime: dto.startTime,
            endTime: dto.endTime,
            type: dto.type,
            status: BookingStatus.CONFIRMED,
        });

        await this.bookingRepo.save(booking);

        return await this.toResponseDto(booking);
    }

    // ── LẤY DANH SÁCH LỊCH ────────────────────────────────────────
    async getList(filters: {
        startDate?: string;
        endDate?: string;   // 'YYYY-MM-DD'
        coachId?: number;
        memberId?: number;
        status?: BookingStatus;
    }): Promise<BookingResponseDto[]> {
        const qb = this.bookingRepo
            .createQueryBuilder('b')
            .leftJoinAndSelect('b.coach', 'coach')
            .leftJoinAndSelect('b.member', 'member')
            .orderBy('b.startTime', 'ASC');

        if (filters.startDate && filters.endDate) {
            qb.andWhere('DATE(b.startTime) >= :startDate', { startDate: filters.startDate })
                .andWhere('DATE(b.endTime) <= :endDate', { endDate: filters.endDate });
        } else if (filters.startDate) {
            qb.andWhere('b.startTime >= :startDate', { startDate: filters.startDate });
        }

        if (filters.coachId) {
            qb.andWhere('b.coach_id = :coachId', { coachId: filters.coachId });
        }
        if (filters.memberId) {
            qb.andWhere('b.member_id = :memberId', { memberId: filters.memberId });
        }
        if (filters.status) {
            qb.andWhere('b.status = :status', { status: filters.status });
        }

        const bookings = await qb.getMany();
        return await Promise.all(bookings.map(b => this.toResponseDto(b)));
    }

    // ── LẤY CHI TIẾT 1 BOOKING ────────────────────────────────────
    async getById(bookingId: number): Promise<BookingResponseDto> {
        const booking = await this.bookingRepo.findOne({
            where: { bookingId },
            relations: ['coach', 'member'],
        });

        if (!booking) throw new NotFoundException('BOOKING_NOT_FOUND');

        return await this.toResponseDto(booking);
    }

    // ── PT HUỶ LỊCH ───────────────────────────────────────────────
    async cancel(bookingId: number, requesterId: number): Promise<void> {
        const booking = await this.bookingRepo.findOne({
            where: { bookingId },
            relations: ['coach'],
        });

        if (!booking) throw new NotFoundException('BOOKING_NOT_FOUND');

        // Chỉ PT sở hữu booking mới được huỷ
        if ((booking.coach.userId as unknown) !== requesterId) {
            throw new ForbiddenException('FORBIDDEN_NOT_YOUR_BOOKING');
        }

        if (booking.status !== BookingStatus.CONFIRMED) {
            throw new BadRequestException('BOOKING_ALREADY_PROCESSED');
        }

        booking.status = BookingStatus.CANCELLED;
        await this.bookingRepo.save(booking);
    }

    //hepler map entity -> dto
    private async toResponseDto(booking: Booking): Promise<BookingResponseDto> {
        let activeSubscriptionId: number | undefined = undefined;

        if (booking.member) {
            const activeSub = await this.memberSubRepo.findOne({
                where: {
                    member: { userId: booking.member.userId },
                    status: MemberSubscriptionStatus.ACTIVE,
                    remainingSession: MoreThan(0)
                }
            })

            if (activeSub) {
                activeSubscriptionId = activeSub.subscriptionId;
            }
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
            subscriptionId: activeSubscriptionId
        };
    }

}