import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UsageLog } from "./entities/usage-log.entity";
import { WorkLog } from "./entities/work-log.entity";

@Module({
    imports: [TypeOrmModule.forFeature([UsageLog, WorkLog])]
})

export class AttendanceModule { }