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
import { ConfigModule, ConfigService } from "@nestjs/config";

@Module({
    imports: [TypeOrmModule.forFeature([RefreshToken, User]),
        PassportModule,
    //jwt global config for auth module
    // Cấu hình JwtModule theo kiểu Async
    JwtModule.registerAsync({
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: async (configService: ConfigService) => {
            const expiresIn = configService.get<string>('JWT_ACCESS_EXPIRED') || '1h';
            return {
                // Lấy secret từ env một cách an toàn
                secret: configService.get<string>('JWT_SECRET'),
                signOptions: {
                    expiresIn: expiresIn as any,
                },
            };
        },
    }),
    ],
    controllers: [AuthController],
    providers: [TokenService, AuthService, JwtStrategy],
    exports: [JwtModule, TokenService, AuthService]
})

export class AuthModule { }