import { Controller, Post, Get, Body, Query, Ip, UseGuards } from '@nestjs/common';
import { OnlinePaymentService } from './online-payment.service';
import { BuyPackageOnlineDto } from './dto/buy-package-online.dto';
import { CurrentUser } from '../user/decorator/user.decorator';
// Import JwtAuthGuard tương ứng của hệ thống bạn
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';

@Controller('online-payment')
export class OnlinePaymentController {
    constructor(private readonly onlinePaymentService: OnlinePaymentService) { }

    @Post('buy-online')
    @UseGuards(JwtAuthGuard)
    async createPayment(
        @CurrentUser('sub') userId: string, // 🟢 Tự động trích xuất userId từ JWT Payload
        @Body() dto: BuyPackageOnlineDto,   // 🟢 NestJS tự động validate bằng class-validator
        @Ip() ip: string,
    ) {
        const paymentUrl = await this.onlinePaymentService.createVnpayUrl(
            userId,
            dto,
            ip || '127.0.0.1',
        );
        console.log(dto, userId)
        return { url: paymentUrl };
    }

    @Get('vnpay-ipn')
    async vnpayIPN(@Query() query: any) {
        return await this.onlinePaymentService.processVnpayIpn(query);
    }
}