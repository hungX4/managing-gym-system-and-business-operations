import { BuyPackageOnlineRequestDto } from '@gym/shared';
import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class BuyOnlineDto implements BuyPackageOnlineRequestDto {
    @IsNotEmpty({ message: 'Gói tập không được để trống.' })
    @Type(() => Number)
    @IsInt({ message: 'packageId phải là số nguyên.' })
    packageId!: number;

    @IsNotEmpty({ message: 'Ngày bắt đầu không được để trống.' })
    @IsDateString({}, { message: 'Ngày bắt đầu không hợp lệ.' })
    startDate!: Date;

    @IsOptional()
    @IsString({ message: 'Mã giảm giá phải là chuỗi.' })
    voucherCode?: string;
}