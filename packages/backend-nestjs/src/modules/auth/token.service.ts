import { Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { RefreshToken } from "./enitites/refresh-token.entity";
import { Repository } from "typeorm";
import { JwtService } from "@nestjs/jwt";
import { User } from "../user/entities/user.entity";
import { AuthResponseDto, JwtPayload } from "@gym/shared";
import * as crypto from 'crypto';
import { buildExpiry } from "../../common/utils/time.util";

@Injectable()
export class TokenService {
    constructor(
        @InjectRepository(RefreshToken)
        private readonly rtRepo: Repository<RefreshToken>,
        private readonly jwtService: JwtService
    ) { }

    async issueTokens(user: User, deviceId = 'default'): Promise<AuthResponseDto & { refreshToken: string }> {
        const payload: JwtPayload = {
            sub: user.userId,
            phone: user.phone,
            roles: user.role,
            jti: crypto.randomUUID(),
        };

        const accessToken = this.jwtService.sign(payload); // ký bằng jwtService

        // Các logic gen RefreshToken, lưu Database
        const rawToken = crypto.randomBytes(64).toString('hex');
        const expiresAt = buildExpiry(process.env.JWT_REFRESH_EXPIRED!);

        const rt = this.rtRepo.create({
            token: rawToken,
            userId: user.userId.toString(),
            deviceId,
            expiresAt,
            isRevoked: false,
            replacedBy: null
        });
        await this.rtRepo.save(rt);

        // Tính toán thời gian hết hạn trả về cho frontend
        const decode = this.jwtService.decode(accessToken) as any;
        const expiredIn = decode.exp - decode.iat;

        return {
            accessToken,
            expiredIn,
            userData: {
                userId: user.userId,
                fullName: user.fullName,
                gmail: user.gmail,
                phone: user.phone,
                role: user.role,
                avatarUrl: user.avatarUrl
            },
            refreshToken: rawToken
        };
    }

    async rotateTokens(
        userId: string,
        deviceId = 'default',
        oldToken: string
    ): Promise<AuthResponseDto & { refreshToken: string }> {

        const stored = await this.rtRepo.findOne({
            where: { token: oldToken, userId, deviceId },
            relations: ['user']
        });

        //có thể bị reuse, nên revoke all
        if (!stored) {
            await this.revokeAllUserToken(userId);
            throw new UnauthorizedException('YOUR_REFRESH_TOKEN_INVALID');
        }

        //token bi thu hoi => detect reuse attack
        if (stored.isRevoked) {
            await this.revokeAllUserToken(userId);
            throw new Error('REFRESH_TOKEN_REUSE_DETECTED');
        }

        //token expired
        if (stored.expiresAt < new Date()) {
            await this.rtRepo.delete({ id: stored.id })
            throw new Error('REFRESH_TOKEN_EXPIRED')
        }

        //danh dau rt cu da revoke, save de audit/detect reuse
        stored.isRevoked = true
        await this.rtRepo.save(stored);

        const newToken = await this.issueTokens(stored.user, deviceId);

        // Ghi replacedBy vào RT cũ để tracing
        stored.replacedBy = newToken.refreshToken;
        await this.rtRepo.save(stored);

        return newToken;
    }

    async revokeAllUserToken(userId: string) {
        await this.rtRepo.update(
            { userId, isRevoked: false },
            { isRevoked: true }
        )
    }

    //revoke token
    async revokeToken(userId: string, deviceId = 'default') {
        await this.rtRepo.update(
            { userId, deviceId, isRevoked: false },
            { isRevoked: true }
        )
    }
}