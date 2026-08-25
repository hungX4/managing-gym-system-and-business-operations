import { CreateTrialLeadDto } from '@gym/shared';
import { Transform } from 'class-transformer';
import { IsString, IsNotEmpty, IsOptional, IsEmail, Matches } from 'class-validator';
//create trial lead for new user
export class CreateTrialLead implements CreateTrialLeadDto {
    @IsString()
    @IsNotEmpty({ message: 'Tên không được để trống' })
    fullName!: string;

    @IsString()
    @Matches(/^[0-9]{10,11}$/, { message: 'Số điện thoại không hợp lệ' })
    phoneNumber!: string;

    @IsEmail({}, { message: 'Email không hợp lệ' })
    @Transform(({ value }) => (value === '' ? undefined : value))
    @IsOptional()
    email?: string;

    @IsString()
    @IsOptional()
    note?: string; // Khách hàng tự note trên web (VD: "Tôi muốn giảm cân")
}