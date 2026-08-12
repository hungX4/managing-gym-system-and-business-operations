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
import { type MemberCheckinRequestDto, type CheckInRequestDto } from '@gym/shared';
// Import Guard tùy theo cấu trúc của bạn
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('checkin')
@UseGuards(JwtAuthGuard) // Bảo vệ toàn bộ các endpoint checkin
export class CheckinController {
    constructor(private readonly checkinService: CheckinService) { }

    // POST /api/v1/checkin/self
    @Post('self')
    async selfCheckin(@Body() dto: MemberCheckinRequestDto) {
        if (!dto.phone) {
            throw new BadRequestException("Vui lòng cung cấp số điện thoại."); //[cite: 7]
        }
        return await this.checkinService.selfCheckin(dto.phone); //[cite: 7]
    }

    // POST /api/v1/checkin/pt
    @Post('pt')
    async ptCheckin(@Body() dto: CheckInRequestDto) {
        if (!dto.bookingId || !dto.subscriptionId || !dto.status) {
            throw new BadRequestException("Thiếu thông tin bắt buộc (bookingId, subscriptionId, status)."); //[cite: 7]
        }
        return await this.checkinService.markBookingAsCompleted(dto); //[cite: 7]
    }

    // GET /api/v1/checkin/history/:subscriptionId
    @Get('history/:id')
    async getHistory(@Param('id', ParseIntPipe) userId: string) {
        if (!userId) {
            throw new BadRequestException("THIẾU USERID"); //[cite: 7]
        }
        return await this.checkinService.getUsageLogByUserId(userId); //[cite: 7]
    }

    // GET /api/v1/checkin/logs?date=YYYY-MM-DD
    @Get('logs')
    async getLogsByDate(@Query('date') date: string) {
        if (!date) {
            throw new BadRequestException("Vui lòng cung cấp tham số ngày (date)."); //[cite: 7]
        }
        return await this.checkinService.getLogsByDate(date); //[cite: 7]
    }
}