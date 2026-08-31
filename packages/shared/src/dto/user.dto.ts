import { IsOptional, IsString } from "class-validator";
import { CoachLevel, CoachType } from "../enums";

//request
export interface MemberSearchRequestDto {
    keyword?: string | undefined
}

export interface UpdateCoachDto {
    fullName?: string;
    phone?: string;
    gmail?: string;
    // Các trường từ CoachProfile
    bio?: string;
}

export interface UpdateUserDto {
    fullName?: string;
    phone?: string;
    gmail?: string;
}
//response
export interface MemberSearchResponseDto {
    memberId: number,
    fullName: string,
    phone: string,
    avatarUrl?: string | null,
    remainingPtSession?: number,
    hasActivePackage: boolean,
    latestEndDate: string | null
}

//coach search
export interface CoachResponseDto {
    userId: string;
    fullName: string;
    phone: string;
    avatarUrl?: string | null;
    gmail?: string;
    // Thông tin lấy từ bảng CoachProfile
    profileId: number | null;
    coachType: CoachType | null;
    coachLevel: CoachLevel | null;
    bio: string | null;
}

export interface UserResponseDto {
    fullName: string;
    phone: string;
    gmail: string;
    avatarUrl?: string | null | undefined
}