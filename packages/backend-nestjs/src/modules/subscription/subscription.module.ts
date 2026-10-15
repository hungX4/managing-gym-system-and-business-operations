import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Package } from "./entities/package.entity";
import { MemberSubscription } from "./entities/member-subscription.entity";
import { Voucher } from "./entities/voucher.entity";
import { PackageController } from "./package.controller";
import { PackageService } from "./package.service";
import { SubscriptionService } from "./subscription.service";
import { User } from "../user/entities/user.entity";
import { SubscriptionController } from "./subscription.controller";

@Module({
    imports: [TypeOrmModule.forFeature([Package, MemberSubscription, Voucher, User])],
    controllers: [PackageController, SubscriptionController],
    providers: [PackageService, SubscriptionService]
}
)
export class SubscriptionModule { }