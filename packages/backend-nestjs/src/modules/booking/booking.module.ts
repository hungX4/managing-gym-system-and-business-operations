import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Booking } from "./entities/booking.entity";
import { UserModule } from "../user/user.module";
import { MemberSubscription } from "../subscription/entities/member-subscription.entity";
import { BookingService } from "./booking.service";
import { BookingController } from "./booking.controller";

@Module({
    imports: [TypeOrmModule.forFeature([Booking, MemberSubscription]), UserModule],
    providers: [BookingService],
    controllers: [BookingController]
})
export class BookingModule { }