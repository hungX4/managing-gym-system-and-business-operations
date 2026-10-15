import {
    Body,
    Controller,
    Get,
    Post,
    Query,
    Req,
    UseGuards
} from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { BuyOnlineDto } from './dto/buy-online.dto';
import { Role } from '@gym/shared';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guad.guard';
import { Roles } from '../auth/decorator/roles.decorator';

@Controller('subscription')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SubscriptionController {
    constructor(private readonly subscriptionService: SubscriptionService) { }

    // POST /api/subscription/contract (Chỉ Staff, Admin, Coach được phép)
    @Post('contract')
    @Roles(Role.ADMIN, Role.STAFF, Role.COACH)
    async createContract(@Body() dto: CreateContractDto) {
        return await this.subscriptionService.createContract(dto);
    }

    // GET /api/subscription/member?memberId=123
    @Get('member')
    @Roles(Role.ADMIN, Role.STAFF, Role.COACH, Role.MEMBER)
    async getMemberSubscriptions(
        @Req() req: any,
        @Query('memberId') queryMemberId?: string
    ) {
        const currentUserId = req.user.userId;
        const currentUserRole = req.user.roles || req.user.role;
        return await this.subscriptionService.getMemberSubscriptions(currentUserId, currentUserRole, queryMemberId);
    }
}