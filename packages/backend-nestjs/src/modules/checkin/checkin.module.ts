import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MemberSubscription } from "../subscription/entities/member-subscription.entity";
import { CheckinService } from "./checkin.service";
import { CheckinController } from "./checkin.controller";

@Module({
    imports: [TypeOrmModule.forFeature([MemberSubscription])],
    controllers: [CheckinController],
    providers: [CheckinService]
})
export class CheckinModule { }