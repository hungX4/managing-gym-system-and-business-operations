import { JwtPayload } from "@gym/shared";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false, // Quá hạn là tự văng lỗi 401
            secretOrKey: configService.get<string>('JWT_SECRET') as any,
        })
    }

    async validate(payload: JwtPayload) {
        return {
            sub: String(payload.sub),
            phone: payload.phone,
            roles: payload.roles
        }
    }
}