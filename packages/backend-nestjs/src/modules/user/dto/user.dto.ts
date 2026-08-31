import { CoachLevel, CoachResponseDto, CoachType, MemberSearchRequestDto, MemberSearchResponseDto, UpdateCoachDto, UserResponseDto } from "@gym/shared";
import { PartialType } from "@nestjs/mapped-types"
import { Exclude, Expose } from "class-transformer";
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
    profileId!: number | null;

    @Expose()
    coachType!: CoachType | null;

    @Expose()
    coachLevel!: CoachLevel | null;

    @Expose()
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