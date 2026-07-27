import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Salary } from "./entities/salary.entity";
import { SalaryConfig } from "./entities/salary-config.entity";

@Module({
    imports: [TypeOrmModule.forFeature([Salary, SalaryConfig])]
})

export class PayrollModule { }