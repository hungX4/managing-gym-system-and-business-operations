import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RefreshToken } from "./enitites/refresh-token.entity";
import { User } from "../user/entities/user.entity";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { AuthController } from "./auth.controller";
import { TokenService } from "./token.service";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./strategies/jwt.strategy";

@Module({
    imports: [TypeOrmModule.forFeature([RefreshToken, User]),
        PassportModule,
    //jwt global config for auth module
    JwtModule.register({
        secret: process.env.JWT_SECRET,
        signOptions: {
            expiresIn: process.env.JWT_ACCESS_EXPIRED as any
        },
    }),
    ],
    controllers: [AuthController],
    providers: [TokenService, AuthService, JwtStrategy],
    exports: [JwtModule, TokenService, AuthService]
})

export class AuthModule { }