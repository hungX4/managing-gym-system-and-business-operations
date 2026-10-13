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
import { GetCheckinLogsQueryDto } from './dto/get-checkin-logs-query.dto';
import { CheckinLogResponseDto } from './dto/checkin-log-response.dto';
import { PtCheckinRequestDto } from './dto/pt-checkin-request.dto';
import { SelfCheckinRequestDto } from './dto/self-checkin-request.dto';
import { SelfCheckinResponseDto } from './dto/self-checkin-response.dto';
import { PtCheckinResponseDto } from './dto/pt-checkin-response.dto';

@Controller('checkin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.STAFF)
export class CheckinController {
    constructor(private readonly checkinService: CheckinService) { }

    // POST /api/v1/checkin/self
    @Post('self')
    async selfCheckin(@Body() dto: SelfCheckinRequestDto): Promise<SelfCheckinResponseDto> {
        return await this.checkinService.selfCheckin(dto);
    }

    // POST /api/v1/checkin/pt
    @Post('pt')
    async ptCheckin(@Body() dto: PtCheckinRequestDto): Promise<PtCheckinResponseDto> {
        return await this.checkinService.markBookingAsCompleted(dto);
    }

    @Get('logs')
    async getLogsByDate(
        @Query() query: GetCheckinLogsQueryDto
    ): Promise<CheckinLogResponseDto[]> {
        return await this.checkinService.getLogsByDate(query.date);
    }
}