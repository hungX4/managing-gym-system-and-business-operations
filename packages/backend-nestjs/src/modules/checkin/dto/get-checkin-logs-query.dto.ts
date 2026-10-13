import { IsDateString, IsNotEmpty } from 'class-validator';

export class GetCheckinLogsQueryDto {
    @IsNotEmpty({ message: 'Ngày không được để trống.' })
    @IsDateString({}, { message: 'Định dạng ngày không hợp lệ (yêu cầu dạng YYYY-MM-DD).' })
    date!: string;
}