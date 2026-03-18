import { CoachType } from "../enums";

//request
export interface CreatePackageRequestDto {
    name: string,
    price: number,
    durationDays: number,
    totalAessions: number | null,
    type: CoachType
}

//response
export interface PackageResponseDto {
    packageId: number,
    name: string,
    price: number,
    durationDays: number,
    totalSessions: number | null,
    type: CoachType,
    isActive: boolean
}