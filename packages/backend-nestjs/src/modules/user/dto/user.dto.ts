import { CoachLevel, CoachResponseDto, CoachType, MemberSearchRequestDto, MemberSearchResponseDto, UpdateCoachDto, UserResponseDto } from "@gym/shared";
import { PartialType } from "@nestjs/mapped-types"
import { Exclude, Expose, Transform } from "class-transformer";
import { IsEmail, IsOptional, IsString } from "class-validator";

export class MemberSearchRequest implements MemberSearchRequestDto {
    @IsString()
    @IsOptional()
    keyword?: string;
}

export class UpdateCoach implements UpdateCoachDto {
    @IsString()
    @IsOptional()
    fullName?: string;

    @IsString()
    @IsOptional()
    phone?: string;

    @IsEmail({}, { message: "Email không đúng định dạng" })
    @IsOptional()
    gmail?: string;

    @IsString()
    @IsOptional()
    bio?: string;
}

export class UpdateUser implements UpdateUser {
    @IsString()
    @IsOptional()
    fullName?: string;

    @IsString()
    @IsOptional()
    phone?: string;

    @IsEmail({}, { message: "Email không đúng định dạng" })
    @IsOptional()
    gmail?: string;
}

// --- RESPONSES ---

export class MemberSearchResponse implements MemberSearchResponseDto {
    @Expose()
    memberId!: number;

    @Expose()
    fullName!: string;

    @Expose()
    phone!: string;

    @Expose()
    avatarUrl?: string | null;

    @Expose()
    remainingPtSession?: number;

    @Expose()
    hasActivePackage!: boolean;

    @Expose()
    latestEndDate!: string | null;
}

export class CoachResponse implements CoachResponseDto {
    @Expose()
    userId!: string

    @Expose()
    fullName!: string;

    @Expose()
    phone!: string;

    @Expose()
    avatarUrl!: string | null;

    @Expose()
    gmail?: string

    @Expose()
    @Transform(({ obj }) => obj.coachProfile?.profileId ?? null)
    profileId!: number | null;

    @Expose()
    @Transform(({ obj }) => obj.coachProfile?.type ?? null)
    coachType!: CoachType | null;

    @Expose()
    @Transform(({ obj }) => obj.coachProfile?.level ?? null)
    coachLevel!: CoachLevel | null;

    @Expose()
    @Transform(({ obj }) => obj.coachProfile?.bio ?? null)
    bio!: string | null;
}

@Exclude()
export class UserResponse implements UserResponseDto {
    @Expose()
    userId!: string;

    @Expose()
    fullName!: string;

    @Expose()
    phone!: string;

    @Expose()
    gmail!: string;

    @Expose()
    avatarUrl?: string
}