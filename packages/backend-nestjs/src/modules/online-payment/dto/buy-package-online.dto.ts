import { IsNotEmpty, IsNumber, IsOptional, IsString, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { BuyPackageOnlineRequestDto } from '@gym/shared';

export class BuyPackageOnlineDto implements BuyPackageOnlineRequestDto {
    @IsNotEmpty({ message: 'packageId không được để trống' })
    @Type(() => Number)
    @IsNumber({}, { message: 'packageId phải là một số' })
    packageId!: number;

    @IsOptional()
    @IsString({ message: 'Voucher code phải là dạng chuỗi' })
    voucherCode?: string;

    @IsOptional()
    @Type(() => Date)
    @IsDate({ message: 'startDate phải là định dạng ngày hợp lệ (ISO Date)' })
    startDate!: Date;
}