import { Role } from "../enums";

//request
export interface RegisterRequestDto {
    passwordRaw: string,
    fullName: string,
    phone: string,
    gmail: string
}

export interface LoginRequestDto {
    phone: string,
    passwordRaw: string,
    deviceId?: string
}

export interface RefreshTokenDto {
    userId: string
    deviceId?: string
    // refreshToken đọc từ cookie, không nhận trong body
}

export interface JwtPayload {
    sub: string //user_id
    phone: string
    roles: Role
    jti: string // unique token id, có thể add blacklist
    iat?: number
    exp?: number
}

//response
export interface UserProfileDto {
    userId: string,
    fullName: string,
    phone: string,
    gmail: string,
    role: Role
}

export interface AuthResponseDto {
    accessToken: string,
    expiredIn: number,
    userData: UserProfileDto
}

