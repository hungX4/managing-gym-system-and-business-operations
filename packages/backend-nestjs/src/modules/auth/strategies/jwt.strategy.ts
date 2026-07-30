import { JwtPayload } from "@gym/shared";
import { Injectable } from "@nestjs/common";
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false, // Quá hạn là tự văng lỗi 401
            secretOrKey: process.env.JWT_SECRET || '',// load file .env
        })
    }

    async validate(payload: JwtPayload) {
        return {
            sub: payload.sub,
            phone: payload.phone,
            roles: payload.roles
        }
    }
}