import { MemberCheckinRequestDto } from '@gym/shared';
import { IsNotEmpty, IsString } from 'class-validator';

export class SelfCheckinRequestDto implements MemberCheckinRequestDto {
    @IsNotEmpty({ message: 'Vui lòng cung cấp mã hội viên hoặc số điện thoại.' })
    @IsString({ message: 'memberId phải là chuỗi ký tự.' })
    memberId!: string;
}