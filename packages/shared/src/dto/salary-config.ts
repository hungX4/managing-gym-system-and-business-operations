import { Role, CoachType, CoachLevel } from '@gym/shared';

export interface UpdateSalaryConfigItemDto {
    configId?: number; // Có id thì là update, không có là create mới
    role: Role;
    coachType?: CoachType | null;
    coachLevel?: CoachLevel | null;
    baseSalary: number;
    pricePerSession?: number;
}

export interface UpdateSalaryConfigDto {
    configs: UpdateSalaryConfigItemDto[];
}