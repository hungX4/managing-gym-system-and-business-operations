import { CreateContractRequestDto, PaymentMethod } from '@gym/shared';
import { IsDateString, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateContractDto implements CreateContractRequestDto {
    @IsNotEmpty({ message: 'Mã hội viên không được để trống.' })
    @IsString({ message: 'memberId phải là chuỗi.' })
    memberId!: string;

    @IsNotEmpty({ message: 'Gói tập không được để trống.' })
    @Type(() => Number)
    @IsInt({ message: 'packageId phải là số nguyên.' })
    packageId!: number;

    @IsOptional()
    @IsString({ message: 'sellerId phải là chuỗi.' })
    sellerId!: string | null;

    @IsNotEmpty({ message: 'Ngày bắt đầu không được để trống.' })
    @IsDateString({}, { message: 'Ngày bắt đầu không hợp lệ.' })
    startDate!: Date;

    @IsNotEmpty({ message: 'Mức giảm giá không được để trống.' })
    @Type(() => Number)
    @Min(0, { message: 'Giảm giá tối thiểu là 0%.' })
    @Max(100, { message: 'Giảm giá tối đa là 100%.' })
    discount!: number;

    @IsNotEmpty({ message: 'Phương thức thanh toán không được để trống.' })
    @IsEnum(PaymentMethod, { message: 'Phương thức thanh toán không hợp lệ.' })
    paymentMethod!: PaymentMethod;
}