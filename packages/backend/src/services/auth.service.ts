import { AuthResponseDto, LoginRequestDto, RegisterRequestDto, Role } from "@gym/shared";
import { AppDataSource } from "../models/data-source";
import { User } from "../models/entity/User";
import bcrypt from 'bcrypt'
import { TokenServices } from "./token.service";
import { Auth } from "typeorm";
import { Request, Response } from "express";

export class AuthServices {

    // private static userReposistory = AppDataSource.getRepository(User);

    static async register(data: RegisterRequestDto): Promise<AuthResponseDto & { refreshToken: string }> {
        try {
            //check if phone existed
            const existingUser = await AppDataSource.getRepository(User).findOne({ where: { phone: data.phone } });
            if (existingUser) {
                throw new Error('PHONE_NUMBER_ALREADY_IN_USE');
            }

            //hash
            const hashedPassword = await bcrypt.hash(data.passwordRaw, 10);

            const newUser = AppDataSource.getRepository(User).create({
                phone: data.phone,
                passwordHash: hashedPassword,
                fullName: data.fullName,
                role: Role.MEMBER,
                gmail: data.gmail
            })

            await AppDataSource.getRepository(User).save(newUser);
            return TokenServices.issueTokens(newUser);
        } catch (error) {
            throw error
        }
    }

    static async login(dto: LoginRequestDto): Promise<AuthResponseDto & { refreshToken: string }> {
        const { phone, passwordRaw, deviceId = 'default' } = dto;

        const user = await AppDataSource.getRepository(User).createQueryBuilder('User')
            .where('User.phone = :phone', { phone: dto.phone })
            .addSelect('User.passwordHash') // select pwd
            .getOne();
        if (!user) throw new Error('INVALID_CREDENTIALS');

        const valid = await bcrypt.compare(passwordRaw, user.passwordHash);
        if (!valid) throw new Error('INVALID_CREDENTIALS');

        return TokenServices.issueTokens(user, deviceId);
    }

    static async refresh(userId: string,
        deviceId = 'default',
        oldToken: string): Promise<AuthResponseDto & { refreshToken: string }> {
        return await TokenServices.rotateTokens(userId, deviceId, oldToken);
    }

    static async logout(userId: string, deviceId = 'default'): Promise<void> {
        await TokenServices.revokeToken(userId, deviceId)
    }

    static async logoutAll(userId: string): Promise<void> {
        await TokenServices.revokeToken(userId)
    }
}