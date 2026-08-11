import { Controller, Post, Get, Patch, Delete, Body, Param, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { BookingService } from './booking.service';
import { Role, type BookingStatus, type CreateBookingRequestDto } from '@gym/shared';// Decorator lấy User từ JWT
import { CurrentUser } from '../user/decorator/user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guad.guard';
import { Roles } from '../auth/decorator/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
// @Roles(Role.COACH, Role.ADMIN)
@Controller('bookings')
export class BookingController {
    constructor(private readonly bookingService: BookingService) { }

    @Post()
    async create(@Body() dto: CreateBookingRequestDto, @CurrentUser('sub') requesterId: string) {
        return await this.bookingService.createNewBooking(dto, requesterId);
    }

    @Get()
    async getBookingList(
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
        @Query('coachId') coachId?: number,
        @Query('memberId') memberId?: number,
        @Query('status') status?: BookingStatus,
    ) {
        return await this.bookingService.getList({
            startDate,
            endDate,
            coachId,
            memberId,
            status,
        });
    }

    @Get(':id')
    async getBookingById(@Param('id', ParseIntPipe) bookingId: number) {
        return await this.bookingService.getById(bookingId);
    }

    @Patch(':id/cancel')
    async cancel(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser('sub') requesterId: string
    ) {
        // Parse requesterId sang kiểu số nếu hàm cancel bên Service đang nhận vào number
        console.log(id, "-", requesterId);
        console.log(typeof id, typeof requesterId);
        await this.bookingService.cancel(id, Number(requesterId));
        return { message: 'Huỷ lịch thành công' };
    }

}