import { AuthResponseDto, JwtPayload, Role } from "@gym/shared";
import { AppDataSource } from "../models/data-source";
import { RefreshToken } from "../models/entity/RefreshToken";
import { User } from "../models/entity/User";
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { buildExpiry } from "../common/utils/time.util";

export class TokenServices {
    private static get repo() {
        return AppDataSource.getRepository(RefreshToken);
    }

    static async issueTokens(user: User, deviceId = 'default'): Promise<AuthResponseDto & { refreshToken: string }> {
        const secret = process.env.JWT_SECRET!;
        const atExpired = process.env.JWT_ACCESS_EXPIRED;
        const rtExpired = process.env.JWT_REFRESH_EXPIRED!;

        //access token
        const payload: JwtPayload = {
            sub: user.userId,
            phone: user.phone,
            roles: user.role,
            jti: crypto.randomUUID(),
        }

        const accessToken = jwt.sign(payload, secret, { expiresIn: atExpired } as any);

        //refresh token - opaque hex, luu db
        const rawToken = crypto.randomBytes(64).toString('hex');
        const expiresAt = buildExpiry(rtExpired);

        // Xoá RT cũ của device này trước (1 device = 1 RT)
        await this.repo.delete({ userId: user.userId.toString(), deviceId })

        //insert
        const rt = this.repo.create({
            token: rawToken,
            userId: user.userId.toString(),
            deviceId,
            expiresAt,
            isRevoked: false,
            replacedBy: null
        })

        await this.repo.save(rt);

        //tinh toan expired
        const decode = jwt.decode(accessToken) as any;
        const expiredIn = (decode.exp - decode.iat) as any;

        return {
            accessToken,
            expiredIn,
            userData: {
                userId: user.userId,
                fullName: user.fullName,
                gmail: user.gmail,
                phone: user.phone,
                role: user.role
            },
            refreshToken: rawToken
        }
    }

    //verify accessToken
    static verify(token: string): JwtPayload {
        return jwt.verify(token, process.env.JWT_SECRET!) as unknown as JwtPayload;
    }

    //rotate
    static async rotateTokens(
        userId: string,
        deviceId = 'default',
        oldToken: string
    ): Promise<AuthResponseDto & { refreshToken: string }> {
        const repo = this.repo;

        const stored = await repo.findOne({
            where: { token: oldToken, userId, deviceId },
            relations: ['user']
        })

        //có thể bị reuse, nên revoke all
        if (!stored) {
            await this.revokeAllUserToken(userId);
            throw new Error('YOUR_REFRESH_TOKEN_INVALID');
        }

        //token bi thu hoi => detect reuse attack
        if (stored.isRevoked) {
            await this.revokeAllUserToken(userId);
            throw new Error('REFRESH_TOKEN_REUSE_DETECTED');
        }

        //token expired
        if (stored.expiresAt < new Date()) {
            await this.repo.delete({ id: stored.id })
            throw new Error('REFRESH_TOKEN_EXPIRED')
        }

        //danh dau rt cu da revoke, save de audit/detect reuse
        stored.isRevoked = true
        await repo.save(stored);

        const newToken = await this.issueTokens(stored.user, deviceId);

        // Ghi replacedBy vào RT cũ để tracing
        stored.replacedBy = newToken.refreshToken;
        await repo.save(stored);

        return newToken;
    }


    //revoke token
    static async revokeToken(userId: string, deviceId = 'default') {
        await this.repo.update(
            { userId, deviceId, isRevoked: false },
            { isRevoked: true }
        )
    }

    static async revokeAllUserToken(userId: string) {
        await this.repo.update(
            { userId, isRevoked: false },
            { isRevoked: true }
        )
    }
}