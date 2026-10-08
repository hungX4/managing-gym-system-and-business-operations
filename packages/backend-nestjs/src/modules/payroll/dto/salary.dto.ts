// src/modules/salary/dto/salary.dto.ts
import { IsNumber, IsOptional, Min, Max, IsArray, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { Role, CoachType, CoachLevel } from '@gym/shared';

export class GetSalaryQueryDto {
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    coachId?: number;

    @Type(() => Number)
    @IsNumber()
    @Min(1)
    @Max(12)
    month!: number;

    @Type(() => Number)
    @IsNumber()
    @Min(2000)
    year!: number;
}

export class FinalizeSalaryDto {
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    @Max(12)
    month!: number;

    @Type(() => Number)
    @IsNumber()
    @Min(2025)
    year!: number;
}

export class GetSalaryDetailQueryDto {
    @Type(() => Number)
    @IsNumber()
    coachId?: number;

    @Type(() => Number)
    @IsNumber()
    @Min(1)
    @Max(12)
    month?: number;

    @Type(() => Number)
    @IsNumber()
    @Min(2000)
    year?: number;
}

export class SalaryConfigItemDto {
    @IsOptional()
    @IsNumber()
    configId?: number;

    @IsEnum(Role, { message: 'Role không hợp lệ' })
    role!: Role;

    @IsOptional()
    @IsEnum(CoachType, { message: 'CoachType không hợp lệ' })
    coachType?: CoachType | null;

    @IsOptional()
    @IsEnum(CoachLevel, { message: 'CoachLevel không hợp lệ' })
    coachLevel?: CoachLevel | null;

    @IsNumber({}, { message: 'baseSalary phải là số' })
    baseSalary!: number;

    @IsOptional()
    @IsNumber({}, { message: 'pricePerSession phải là số' })
    pricePerSession?: number;
}

export class UpdateSalaryConfigDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SalaryConfigItemDto)
    configs?: SalaryConfigItemDto[];
}