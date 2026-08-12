// src/modules/attendance/attendance.controller.ts

import { Controller, Get, Param, Query, BadRequestException, UseGuards, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { Role } from '@gym/shared';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guad.guard';
import { Roles } from '../auth/decorator/roles.decorator';

@Controller('attendance') // Đổi prefix sang attendance
//@UseGuards(JwtAuthGuard)
export class AttendanceController {
    constructor(private readonly attendanceService: AttendanceService) { }

    // GET /api/v1/attendance/history/:id
    @Get('history/:id')
    async getHistory(
        @Param('id') userId: string,
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number
    ) {
        if (!userId) {
            throw new BadRequestException("THIẾU USERID");
        }
        // Gọi thẳng vào service mới, truyền thêm tham số phân trang
        return await this.attendanceService.getUsageLogByUserId(userId, page, limit);
    }

    // GET /api/v1/attendance/logs?date=YYYY-MM-DD
    @Get('logs')
    async getLogsByDate(@Query('date') date: string) {
        if (!date) {
            throw new BadRequestException("Vui lòng cung cấp tham số ngày (date).");
        }
        return await this.attendanceService.getLogsByDate(date);
    }
}