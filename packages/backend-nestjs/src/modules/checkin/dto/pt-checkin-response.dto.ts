// src/modules/checkin/dto/pt-checkin-response.dto.ts
import { Expose } from 'class-transformer';
import { CheckInResponseDto } from '@gym/shared';

export class PtCheckinResponseDto implements CheckInResponseDto {
    @Expose()
    message!: string;

    @Expose()
    bookingId!: number;

    @Expose()
    coachName!: string;

    @Expose()
    memberName?: string;

    @Expose()
    remainingSession?: number;

    @Expose()
    earned_amount!: number;
}