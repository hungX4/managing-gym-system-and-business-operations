import { Expose, Transform } from 'class-transformer';
import { WorkLogStatus } from '@gym/shared';

export class CheckinLogResponseDto {
    @Expose()
    usageLogId!: number;

    @Expose()
    checkinTime!: Date;

    @Expose()
    @Transform(({ obj }) => obj.member?.fullName ?? null)
    memberName!: string;

    @Expose()
    @Transform(({ obj }) => obj.member?.phone ?? null)
    memberPhone!: string;

    @Expose()
    @Transform(({ obj }) => obj.subscription?.package?.name ?? null)
    packageName!: string;

    @Expose()
    @Transform(({ obj }) => obj.workLog?.coach?.fullName ?? null)
    coachName?: string | null;

    @Expose()
    @Transform(({ obj }) => {
        if (obj.workLog) {
            return obj.workLog.status === WorkLogStatus.COMPLETED
                ? 'Tập cùng PT'
                : 'Bị trừ do Late Cancel';
        }
        return 'Tự tập (Gym)';
    })
    type!: string;
}