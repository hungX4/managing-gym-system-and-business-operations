import { CoachLevel, CoachType } from "../enums";

//request
export interface MemberSearchRequestDto {
    keyword: string
}

//response
export interface MemberSearchResponseDto {
    memberId: number,
    fullName: string,
    phone: string,
    avatarUrl: string | null,
    remainingPtSession: number,
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