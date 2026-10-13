import { CheckInRequestDto, WorkLogStatus } from '@gym/shared';
import { IsEnum, IsInt, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class PtCheckinRequestDto implements CheckInRequestDto {
    @IsNotEmpty({ message: 'bookingId không được để trống.' })
    @Type(() => Number)
    @IsInt({ message: 'bookingId phải là số nguyên.' })
    bookingId!: number;

    @IsNotEmpty({ message: 'subscriptionId không được để trống.' })
    @Type(() => Number)
    @IsInt({ message: 'subscriptionId phải là số nguyên.' })
    subscriptionId!: number;

    @IsNotEmpty({ message: 'Trạng thái status không được để trống.' })
    @IsEnum(WorkLogStatus, { message: 'Trạng thái status không hợp lệ.' })
    status!: WorkLogStatus;
}