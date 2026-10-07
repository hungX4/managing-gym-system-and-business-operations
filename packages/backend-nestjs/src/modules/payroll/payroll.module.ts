// src/modules/salary/salary.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalaryController } from './salary.controller';
import { SalaryService } from './salary.service';
import { SalaryConfigController } from './salary-config.controller';
import { SalaryConfigService } from './salary-config.service';

import { User } from '../user/entities/user.entity';
import { MemberSubscription } from '../subscription/entities/member-subscription.entity';
import { SalaryConfig } from './entities/salary-config.entity';
import { Salary } from './entities/salary.entity';
import { WorkLog } from '../attendance/entities/work-log.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            User,
            MemberSubscription,
            WorkLog,
            SalaryConfig,
            Salary,
        ]),
    ],
    controllers: [SalaryController, SalaryConfigController],
    providers: [SalaryService, SalaryConfigService],
    exports: [SalaryService, SalaryConfigService],
})
export class PayrollModule { }