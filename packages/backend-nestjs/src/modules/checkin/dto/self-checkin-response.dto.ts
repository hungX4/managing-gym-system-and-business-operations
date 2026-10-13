// src/modules/checkin/dto/self-checkin-response.dto.ts
import { Expose } from 'class-transformer';
import { MemberCheckinResponseDto } from '@gym/shared';

export class SelfCheckinResponseDto implements MemberCheckinResponseDto {
    @Expose()
    message!: string;

    @Expose()
    memberName!: string;

    @Expose()
    packageName!: string;
}