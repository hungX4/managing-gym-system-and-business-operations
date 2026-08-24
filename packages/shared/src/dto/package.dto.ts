import { IsEnum, IsInt, IsNotEmpty, IsNumber, IsString, Min, ValidateIf } from "class-validator";
import { PackageType } from "../enums";
import { Type } from "class-transformer";

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
    totalSession: number | null
    type: PackageType
    isActive: boolean
}