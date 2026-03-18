import { Role } from "../enums";

//request
export interface RegisterRequestDto {
    passwordRaw: string,
    fullName: string,
    phone: string,
    gmail: string
}

export interface LoginRequestDto {
    username: string,
    passwordRaw: string
}

//response
export interface UserProfileDto {
    userId: string,
    userName: string,
    fullName: string,
    phone: string,
    gmail: string,
    role: Role
}

export interface AuthResponseDto {
    accessToken: string,
    userData: UserProfileDto
}