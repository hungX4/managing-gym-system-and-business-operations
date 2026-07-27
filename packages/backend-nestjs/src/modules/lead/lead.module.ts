import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TrialLead } from "./entities/trial-lead.entity";

@Module({
    imports: [TypeOrmModule.forFeature([TrialLead])]
})

export class TrialLeadModule { }