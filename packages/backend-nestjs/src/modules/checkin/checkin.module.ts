import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MemberSubscription } from "../subscription/entities/member-subscription.entity";
import { CheckinService } from "./checkin.service";
import { CheckinController } from "./checkin.controller";
import { Booking } from "../booking/entities/booking.entity";
import { UsageLog } from "../attendance/entities/usage-log.entity";

@Module({
    imports: [TypeOrmModule.forFeature([MemberSubscription, Booking, UsageLog])],
    controllers: [CheckinController],
    providers: [CheckinService]
})
export class CheckinModule { }