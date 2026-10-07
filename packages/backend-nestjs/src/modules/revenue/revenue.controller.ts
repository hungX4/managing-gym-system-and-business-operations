import { Controller, Get, Query } from '@nestjs/common';
import { RevenueService } from './revenue.service';
import { GetRevenueQueryDto } from './dto/get-revenue-query.dto';

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