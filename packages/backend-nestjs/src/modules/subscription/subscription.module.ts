import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Package } from "./entities/package.entity";
import { MemberSubscription } from "./entities/member-subscription.entity";
import { Voucher } from "./entities/voucher.entity";

@Module({
    imports: [TypeOrmModule.forFeature([Package, MemberSubscription, Voucher])]
}
)
export class SubscriptionModule { }