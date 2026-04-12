import { JwtPayload, Role } from "@gym/shared";
import { NextFunction, Request, Response } from "express";
import { TokenServices } from "../services/token.services";

// Mở rộng Express Request để các controller dùng được req.user
declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload
        }
    }
}

export class AuthMiddleware {
    static authenticate(req: Request, res: Response, next: NextFunction) {
        const header = req.headers.authorization;

        if (!header?.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'NO_TOKEN_PROVIDED' });
        }

        const token = header.slice(7);
        console.log(token);
        try {
            const payload = TokenServices.verify(token);
            req.user = payload;
            next();
        } catch (error: any) {
            const message = error.name === 'TokenExpiredError'
                ? 'TOKEN_EXPIRED'
                : 'TOKEN_INVALID';
            return res.status(401).json({ message });
        }
    }

    static authorize(...allowedRoles: Role[]) {
        return (req: Request, res: Response, next: NextFunction) => {
            if (!req.user) {
                return res.status(401).json({ message: 'UNAUTHORIZE' });
            }
            //lay role tu token
            const userRole = req.user.roles;

            const isAllowed = allowedRoles.includes(userRole);

            if (!isAllowed) {
                return res.status(403).json({ message: 'FORBIDDEN: INSUFFICIENT_ROLE' });
            }

            next();
        }
    }
}