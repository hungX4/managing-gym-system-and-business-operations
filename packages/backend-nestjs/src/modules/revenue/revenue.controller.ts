import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { RevenueService } from './revenue.service';
import { GetRevenueQueryDto } from './dto/get-revenue-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guad.guard';
import { Roles } from '../auth/decorator/roles.decorator';
import { Role } from '@gym/shared';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin')
export class RevenueController {
    constructor(private readonly revenueService: RevenueService) { }

    @Get()
    async getFullStats(@Query() query: GetRevenueQueryDto) {
        const data = await this.revenueService.getFullDashboardData(query.month, query.year);

        // Trả về format để NestJS TransformInterceptor đóng bọc response
        return {
            message: 'Lấy dữ liệu Dashboard thành công',
            data,
        };
    }
}