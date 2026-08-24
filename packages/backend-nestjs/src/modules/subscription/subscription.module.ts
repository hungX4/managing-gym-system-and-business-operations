import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Package } from "./entities/package.entity";
import { MemberSubscription } from "./entities/member-subscription.entity";
import { Voucher } from "./entities/voucher.entity";
import { PackageController } from "./package.controller";
import { PackageService } from "./package.service";

@Module({
    imports: [TypeOrmModule.forFeature([Package, MemberSubscription, Voucher])],
    controllers: [PackageController],
    providers: [PackageService]
}
)
export class SubscriptionModule { }