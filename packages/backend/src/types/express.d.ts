import { JwtPayload } from '@gym/shared';
import { Request } from 'express';

declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload
        }
    }
}