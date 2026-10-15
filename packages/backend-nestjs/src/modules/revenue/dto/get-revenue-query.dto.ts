import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class GetRevenueQueryDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'INVALID_MONTH' })
    @Min(1, { message: 'INVALID_MONTH' })
    @Max(12, { message: 'INVALID_MONTH' })
    month?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'INVALID_YEAR' })
    @Min(2000, { message: 'INVALID_YEAR' })
    year?: number;
}