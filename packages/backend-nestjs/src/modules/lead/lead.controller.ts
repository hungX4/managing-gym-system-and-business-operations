import {
    Controller,
    Get,
    Post,
    Patch,
    Body,
    Param,
    Query,
    ParseIntPipe,
    UseGuards
} from '@nestjs/common';
import { LeadService } from './lead.service';
import { GetLeadsFilterDto, Role } from '@gym/shared';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guad.guard';
import { Roles } from '../auth/decorator/roles.decorator';
import { CreateTrialLead, UpdateTrialLead } from './dto/lead.dto';

@Controller('trial-leads')
export class LeadController {
    constructor(private readonly LeadService: LeadService) { }

    // POST /trial-leads/web (Web đăng ký dùng thử)
    @Post('web')
    async createWebLead(@Body() data: CreateTrialLead) {
        const newLead = await this.LeadService.createNewData(data);
        return {
            message: 'Gửi yêu cầu thành công',
            data: newLead
        };
    }

    // GET /trial-leads (Admin lấy danh sách)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Get()
    async getLeads(@Query() filters: GetLeadsFilterDto) {
        return await this.LeadService.getDataList(filters);
    }

    // PATCH /trial-leads/:id (Cập nhật thông tin chăm sóc)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Patch(':id')
    async updateLeadDetails(
        @Param('id', ParseIntPipe) leadId: number, // 💡 ParseIntPipe tự động ép /:id sang kiểu number
        @Body() data: UpdateTrialLead,
    ) {
        console.log(leadId, data)
        return await this.LeadService.updateLead(leadId, data);
    }
}