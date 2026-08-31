// update-trial.dto.ts for admin to update
import { IsEnum, IsOptional, IsNumber, IsString } from 'class-validator';
import { TrialStatus } from '../enums';

export interface UpdateTrialLeadDto {
    status?: TrialStatus;
    assignedToId?: string; // Giao cho nhân viên nào chăm sóc
    adminNote?: string; // Note nội bộ của nhân viên (VD: "Khách hẹn cuối tuần qua")
}

export class GetLeadsFilterDto {
    @IsOptional()
    @IsEnum(TrialStatus)
    status?: TrialStatus;

    @IsOptional()
    //@Type(() => Number) //Tự động convert query string "123" -> number 123
    assignedToId?: string;
}

export interface AssignedCoachDto {
    userId: number;
    fullName: string;
    phone: string;
    avatarUrl?: string | null;
}

export interface TrialLeadResponseDto {
    id: number;
    fullName: string;
    phoneNumber: string;
    email: string | null;
    status: TrialStatus; // Dùng enum để đồng bộ với state
    guestNote: string | null;
    adminNote: string;
    assignedTo: AssignedCoachDto | null; // Nếu chưa giao thì BE thường trả về null
    createdAt: string;
    updatedAt: string;
}