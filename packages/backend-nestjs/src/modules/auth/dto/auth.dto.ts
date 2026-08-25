import { IsString, IsNotEmpty, IsEmail, IsOptional, IsEnum, MinLength } from "class-validator";
import { Expose, Type } from "class-transformer";
import {

    AuthResponseDto,
    JwtPayloadDto,
    LoginRequestDto,
    RefreshTokenDto,
    RegisterRequestDto,
    Role,
    UserProfileDto
} from "@gym/shared";

// --- REQUESTS ---

export class RegisterRequest implements RegisterRequestDto {
    @IsString()
    @IsNotEmpty({ message: "Họ và tên không được để trống" })
    fullName!: string;

    @IsString()
    @IsNotEmpty({ message: "Số điện thoại không được để trống" })
    phone!: string;

    @IsEmail({}, { message: "Email không đúng định dạng" })
    @IsNotEmpty({ message: "Email không được để trống" })
    gmail!: string;

    @IsString()
    @MinLength(6, { message: "Mật khẩu tối thiểu 6 ký tự" })
    @IsNotEmpty({ message: "Mật khẩu không được để trống" })
    passwordRaw!: string;
}

export class LoginRequest implements LoginRequestDto {
    @IsString()
    @IsNotEmpty({ message: "Số điện thoại không được để trống" })
    phone!: string;

    @IsString()
    @IsNotEmpty({ message: "Mật khẩu không được để trống" })
    passwordRaw!: string;

    @IsString()
    @IsOptional()
    deviceId?: string;
}

export interface JwtPayload {
    sub: string
    phone: string
    roles: Role
    jti: string
    iat?: number
    exp?: number
}

// --- RESPONSES ---

export class UserProfile implements UserProfileDto {
    @Expose()
    userId!: string;

    @Expose()
    fullName!: string;

    @Expose()
    phone!: string;

    @Expose()
    gmail!: string;

    @Expose()
    role!: Role;

    @Expose()
    avatarUrl?: string;
}

export class AuthResponse implements AuthResponseDto {
    @Expose()
    accessToken!: string;

    @Expose()
    expiredIn!: number;

    @Expose()
    @Type(() => UserProfile)
    userData!: UserProfile;
}