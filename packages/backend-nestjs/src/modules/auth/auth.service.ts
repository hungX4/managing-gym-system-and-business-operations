import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "../user/entities/user.entity";
import { Repository } from "typeorm";
import { TokenService } from "./token.service";
import { AuthResponseDto, LoginRequestDto, RegisterRequestDto, Role } from "@gym/shared";
import * as bcrypt from 'bcrypt';
@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly userReposistory: Repository<User>,
        private readonly tokenService: TokenService
    ) { }

    async register(data: RegisterRequestDto): Promise<AuthResponseDto & { refreshToken: string }> {
        const existingUser = await this.userReposistory.findOne({ where: { phone: data.phone } });
        if (existingUser) {
            throw new ConflictException('PHONE_NUMBER_ALREADY_IN_USE!');
        };

        //hash
        const hashedPassword = await bcrypt.hash(data.passwordRaw, 10);

        //create new user
        const newUser = this.userReposistory.create({
            phone: data.phone,
            passwordHash: hashedPassword,
            fullName: data.fullName,
            role: Role.MEMBER,
            gmail: data.gmail
        });

        await this.userReposistory.save(newUser);

        return this.tokenService.issueTokens(newUser);
    }

    async login(dto: LoginRequestDto): Promise<AuthResponseDto & { refreshToken: string }> {
        const { phone, passwordRaw, deviceId = 'default' } = dto;

        const user = await this.userReposistory.createQueryBuilder("User")
            .where('User.phone= :phone', { phone })
            .addSelect('User.passwordHash')
            .getOne();

        if (!user) {
            throw new UnauthorizedException('INVALID_CREDENTIALS');
        }

        const passwordValid = await bcrypt.compare(passwordRaw, user.passwordHash);
        if (!passwordValid) {
            throw new UnauthorizedException('INVALID_CREDENTIALS');
        }

        return this.tokenService.issueTokens(user, deviceId);
    }

    async refresh(userId: string, deviceId = 'default', oldToken: string): Promise<AuthResponseDto & { refreshToken: string }> {
        return await this.tokenService.rotateTokens(userId, deviceId, oldToken);
    }

    async logout(userId: string, deviceId = 'default'): Promise<void> {
        await this.tokenService.revokeToken(userId, deviceId);
    }

    async logoutAll(userId: string): Promise<void> {
        await this.tokenService.revokeAllUserToken(userId);
    }
}