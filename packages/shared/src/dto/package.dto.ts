import { PackageType } from "../enums";


//request
export interface CreatePackageRequestDto {
    name: string;
    price: number;
    durationDays: number;
    totalSessions?: number | null;
    type: PackageType;
}

//response
export interface PackageResponseDto {
    packageId: number
    name: string
    price: number
    durationDays: number
    totalSession?: number | null | undefined
    type: PackageType
    isActive: boolean
}