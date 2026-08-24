// backend/src/packages/dto/create-package.dto.ts
import { IsString, IsNotEmpty, IsNumber, Min, IsInt, IsEnum, ValidateIf } from 'class-validator';
import { Expose, Type } from 'class-transformer';
import { CreatePackageRequestDto, PackageResponseDto, PackageType } from '@gym/shared';

export class CreatePackageRequest implements CreatePackageRequestDto {
    @IsString()
    @IsNotEmpty()
    name!: string;

    @Type(() => Number)
    @IsNumber()
    @Min(0)
    price!: number;

    @Type(() => Number)
    @IsInt()
    @Min(1)
    durationDays!: number;

    @ValidateIf(obj => obj.type === PackageType.COACHING)
    @IsNotEmpty()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    totalSessions?: number | null;

    @IsEnum(PackageType)
    type!: PackageType;
}

export class PackageResponse implements PackageResponseDto {
    @Expose()
    packageId!: number;

    @Expose()
    name!: string;

    @Expose()
    price!: number;

    @Expose()
    durationDays!: number;

    @Expose()
    totalSession?: number | null;

    @Expose()
    type!: PackageType;

    @Expose()
    isActive!: boolean;
}

