import { IsOptional, IsString } from "class-validator";
import { CoachLevel, CoachType } from "../enums";

//request
export interface MemberSearchRequestDto {
    keyword: string
}

export class UpdateCoachDto {
    @IsString()
    @IsOptional()
    fullName?: string;

    @IsString()
    @IsOptional()
    phone?: string;

    @IsString()
    @IsOptional()
    gmail?: string;

    // Các trường từ CoachProfile
    @IsString()
    @IsOptional()
    bio?: string;
}

export class UpdateUserDto {
    @IsString()
    @IsOptional()
    fullName?: string;

    @IsString()
    @IsOptional()
    phone?: string;

    @IsString()
    @IsOptional()
    gmail?: string;
}
//response
export interface MemberSearchResponseDto {
    memberId: number,
    fullName: string,
    phone: string,
    avatarUrl: string | null,
    remainingPtSession: number,
    hasActivePackage: boolean,
    latestEndDate: string | null
}

//coach search
export interface CoachResponseDto {
    userId: string;
    fullName: string;
    phone: string;
    avatarUrl: string | null;

    // Thông tin lấy từ bảng CoachProfile
    profileId: number | null;
    coachType: CoachType | null;
    coachLevel: CoachLevel | null;
    bio: string | null;
}