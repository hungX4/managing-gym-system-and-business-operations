import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TrialLead } from "./entities/trial-lead.entity";
import { User } from "../user/entities/user.entity";
import { LeadController } from "./lead.controller";
import { LeadService } from "./lead.service";

@Module({
    imports: [TypeOrmModule.forFeature([TrialLead, User])],
    controllers: [LeadController],
    providers: [LeadService]
})

export class TrialLeadModule { }