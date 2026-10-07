import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RevenueController } from './revenue.controller';
import { RevenueService } from './revenue.service'; // Sửa lại đường dẫn entity của bạn
import { MemberSubscription } from '../subscription/entities/member-subscription.entity';

@Module({
    imports: [TypeOrmModule.forFeature([MemberSubscription])],
    controllers: [RevenueController],
    providers: [RevenueService],
})
export class RevenueModule { }