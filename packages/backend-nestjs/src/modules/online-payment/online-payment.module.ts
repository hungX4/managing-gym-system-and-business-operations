import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OnlinePaymentController } from './online-payment.controller';
import { OnlinePaymentService } from './online-payment.service';

import { MemberSubscription } from '../subscription/entities/member-subscription.entity';
import { Package } from '../subscription/entities/package.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Package, MemberSubscription])],
    controllers: [OnlinePaymentController],
    providers: [OnlinePaymentService],
})
export class OnlinePaymentModule { }