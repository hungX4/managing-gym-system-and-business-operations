// src/modules/checkin/checkin.controller.ts

import {
    Controller,
    Post,
    Get,
    Body,
    Param,
    Query,
    ParseIntPipe,
    BadRequestException,
    UseGuards
} from '@nestjs/common';
import { CheckinService } from './checkin.service';
import { type MemberCheckinRequestDto, type CheckInRequestDto, Role } from '@gym/shared';
// Import Guard tùy theo cấu trúc của bạn
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guad.guard';
import { Roles } from '../auth/decorator/roles.decorator';

@Controller('checkin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.STAFF)
export class CheckinController {
    constructor(private readonly checkinService: CheckinService) { }

    // POST /api/v1/checkin/self
    @Post('self')
    async selfCheckin(@Body() dto: MemberCheckinRequestDto) {
        if (!dto.memberId) {
            throw new BadRequestException("Vui lòng cung cấp số điện thoại.");
        }
        return await this.checkinService.selfCheckin(dto.memberId);
    }

    // POST /api/v1/checkin/pt
    @Post('pt')
    async ptCheckin(@Body() dto: CheckInRequestDto) {
        if (!dto.bookingId || !dto.subscriptionId || !dto.status) {
            throw new BadRequestException("Thiếu thông tin bắt buộc (bookingId, subscriptionId, status).");
        }
        return await this.checkinService.markBookingAsCompleted(dto);
    }

    // GET /api/v1/checkin/history/:id
    @Get('history/:id')
    async getHistory(@Param('id') userId: string) {
        if (!userId) {
            throw new BadRequestException("THIẾU USERID");
        }
        return await this.checkinService.getUsageLogByUserId(userId);
    }

    // GET /api/v1/checkin/logs?date=YYYY-MM-DD
    @Get('logs')
    async getLogsByDate(@Query('date') date: string) {
        if (!date) {
            throw new BadRequestException("Vui lòng cung cấp tham số ngày (date).");
        }
        return await this.checkinService.getLogsByDate(date);
    }
}