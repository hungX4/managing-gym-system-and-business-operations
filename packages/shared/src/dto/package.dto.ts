import { IsEnum, IsInt, IsNotEmpty, IsNumber, IsString, Min, ValidateIf } from "class-validator";
import { PackageType } from "../enums";
import { Type } from "class-transformer";

//request
export class CreatePackageRequestDto {
    @IsString({ message: 'Tên gói tập phải là chuỗi hợp lệ.' })
    @IsNotEmpty({ message: 'Tên gói tập không được để trống.' })
    name: string

    @Type(() => Number) // Tự động ép kiểu chuỗi "5000" thành số 5000
    @IsNumber({}, { message: 'Giá tiền phải là số.' })
    @Min(0, { message: 'Giá tiền không được nhỏ hơn 0.' })
    price: number

    @Type(() => Number)
    @IsInt({ message: 'Thời hạn phải là số nguyên.' })
    @Min(1, { message: 'Thời hạn phải lớn hơn 0 ngày.' })
    durationDays: number

    // Chỉ bắt buộc kiểm tra nếu type là COACHING
    @ValidateIf(obj => obj.type === PackageType.COACHING)
    @IsNotEmpty({ message: 'Gói PT 1-1 bắt buộc phải nhập tổng số buổi.' })
    @Type(() => Number)
    @IsInt({ message: 'Tổng số buổi phải là số nguyên.' })
    @Min(1, { message: 'Tổng số buổi phải lớn hơn 0.' })
    totalSessions?: number | null

    @IsEnum(PackageType, { message: 'Loại gói tập không hợp lệ.' })
    type: PackageType
}

//response
export class PackageResponseDto {
    packageId: number
    name: string
    price: number
    durationDays: number
    totalSession: number | null
    type: PackageType
    isActive: boolean
}