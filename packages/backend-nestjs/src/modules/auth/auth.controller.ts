// src/modules/auth/auth.controller.ts
import {
    Controller, Post, Body, Res, Req, HttpCode, HttpStatus,
    UnauthorizedException, UseGuards, Headers
} from '@nestjs/common';
import type { Request, Response, CookieOptions } from 'express';
import { RegisterRequestDto, LoginRequestDto } from '@gym/shared';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard'; // Đường dẫn tới Guard đã tạo

const COOKIE_OPTIONS: CookieOptions = {
    httpOnly: true,
    secure: false,
    sameSite: 'strict',
    path: '/api/v1/auth/refresh',
    maxAge: 30 * 24 * 3600 * 1000,
};

const CLEAR_COOKIE_OPTIONS: CookieOptions = {
    path: '/api/v1/auth/refresh',
};

@Controller('auth') // Route gốc: /auth
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    async register(
        @Body() dto: RegisterRequestDto,
        @Res({ passthrough: true }) res: Response
    ) {
        const { refreshToken, ...response } = await this.authService.register(dto);
        res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
        return response; // Tự động trả về HTTP 201 Created
    }

    @Post('login')
    @HttpCode(HttpStatus.OK) // Thay đổi HTTP 201 mặc định thành 200 OK
    async login(
        @Body() dto: LoginRequestDto,
        @Res({ passthrough: true }) res: Response
    ) {
        const { refreshToken, ...response } = await this.authService.login(dto);
        res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
        return response;
    }

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    async refresh(
        @Req() req: Request,
        @Body() body: any,
        @Res({ passthrough: true }) res: Response
    ) {
        try {
            console.log("👉 Đang check Cookie: ", req.cookies);
            const refreshToken = req.cookies?.refreshToken;
            const { userId, deviceId = 'default' } = body;

            if (!refreshToken || !userId) {
                throw new UnauthorizedException('MISSING TOKEN');
            }

            const { refreshToken: newRt, ...response } = await this.authService.refresh(userId, deviceId, refreshToken);
            res.cookie('refreshToken', newRt, COOKIE_OPTIONS);
            return response;
        } catch (error) {
            res.clearCookie('refreshToken', CLEAR_COOKIE_OPTIONS);
            throw error;
        }
    }

    @Post('logout')
    @UseGuards(JwtAuthGuard) // Bắt buộc phải có token hợp lệ
    @HttpCode(HttpStatus.OK)
    async logout(
        @Req() req: any,
        @Headers('x-device-id') deviceIdHeader: string,
        @Res({ passthrough: true }) res: Response
    ) {
        const deviceId = deviceIdHeader ?? 'default';
        const userId = req.user.sub; // Trích xuất tự động từ Guard

        await this.authService.logout(userId, deviceId);
        res.clearCookie('refreshToken', CLEAR_COOKIE_OPTIONS);

        return { message: 'Logged out successfully' };
    }

    @Post('logout-all')
    @UseGuards(JwtAuthGuard) // Bắt buộc phải có token hợp lệ
    @HttpCode(HttpStatus.OK)
    async logoutAll(
        @Req() req: any,
        @Res({ passthrough: true }) res: Response
    ) {
        const userId = req.user.sub; // Trích xuất tự động từ Guard

        await this.authService.logoutAll(userId);
        res.clearCookie('refreshToken', CLEAR_COOKIE_OPTIONS);

        return { message: 'All sessions revoked' };
    }
}