import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class GetRevenueQueryDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'Tháng phải là số nguyên' })
    @Min(1, { message: 'Tháng phải từ 1 đến 12' })
    @Max(12, { message: 'Tháng phải từ 1 đến 12' })
    month?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'Năm phải là số nguyên' })
    @Min(2025, { message: 'Năm không hợp lệ' })
    year?: number;
}