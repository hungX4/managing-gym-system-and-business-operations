import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UsageLog } from "./entities/usage-log.entity";
import { WorkLog } from "./entities/work-log.entity";
import { AttendanceService } from "./attendance.service";
import { AttendanceController } from "./attendance.controller";

@Module({
    imports: [TypeOrmModule.forFeature([UsageLog, WorkLog])],
    controllers: [AttendanceController],
    providers: [AttendanceService]
})

export class AttendanceModule { }