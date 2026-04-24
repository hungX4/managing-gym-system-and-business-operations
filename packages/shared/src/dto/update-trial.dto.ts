// update-trial.dto.ts for admin to update
import { IsEnum, IsOptional, IsNumber, IsString } from 'class-validator';
import { TrialStatus } from '../enums';

export class UpdateTrialLeadDto {
    @IsEnum(TrialStatus)
    @IsOptional()
    status?: TrialStatus;

    @IsString()
    @IsOptional()
    assignedToId?: string; // Giao cho nhân viên nào chăm sóc

    @IsString()
    @IsOptional()
    adminNote?: string; // Note nội bộ của nhân viên (VD: "Khách hẹn cuối tuần qua")
}