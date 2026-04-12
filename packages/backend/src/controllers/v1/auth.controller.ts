import { NextFunction, Request, Response } from "express";
import { AuthServices } from "../../services/auth.services";
import { JwtPayload, LoginRequestDto, RegisterRequestDto } from "@gym/shared";

declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload
        }
    }
}

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === 'true',
    sameSite: (process.env.COOKIE_SAME_SITE ?? 'strict') as 'strict',
    path: '/api/v1/auth/refresh',
    maxAge: 30 * 24 * 3600 * 1000,
}

const CLEAR_COOKIE_OPTIONS = {
    path: '/api/v1/auth/refresh',
}
export class AuthController {

    static register = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const dto = req.body as RegisterRequestDto;
            const { refreshToken, ...response } = await AuthServices.register(dto);
            res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
            res.status(201).json(response);
        } catch (error: any) {
            next(error);
        }
    }

    static login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const dto = req.body as LoginRequestDto;
            const { refreshToken, ...response } = await AuthServices.login(dto);

            res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
            res.json(response);
        } catch (error) {
            next(error) //chuyen loi sang middleware
        }
    }

    static async refresh(req: Request, res: Response, next: NextFunction) {
        try {
            const refreshToken = req.cookies?.refreshToken;
            const { userId, deviceId = 'default' } = req.body;

            if (!refreshToken || !userId) {
                res.status(401).json({ message: 'MISSING TOKEN' });
                return;
            }
            //    //so sanh rt tu cookie va rt tu req.body
            //    if(rt !== refreshToken){
            //     res.status(401).json({message: 'Token MISSMATCH - POTENTIAL CSRF ATTACK'});
            //    }

            const { refreshToken: newRt, ...response } = await AuthServices.refresh(userId, deviceId, refreshToken);
            res.cookie('refreshToken', newRt, COOKIE_OPTIONS);
            res.json(response);
        } catch (error) {
            res.clearCookie('refreshToken', CLEAR_COOKIE_OPTIONS);
            next(error);
        }
    }

    static async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const deviceId = req.headers['x-device-id'] as string ?? 'default'
            await AuthServices.logout(req.user!.sub, deviceId);
            res.clearCookie('refreshToken', CLEAR_COOKIE_OPTIONS);
            res.json({ message: 'Logged out successfully' });
        } catch (err) {
            next(err)
        }
    }

    static async logoutAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            await AuthServices.logoutAll(req.user!.sub)
            res.clearCookie('refreshToken', CLEAR_COOKIE_OPTIONS)
            res.json({ message: 'All sessions revoked' })
        } catch (err) {
            next(err)
        }
    }

}