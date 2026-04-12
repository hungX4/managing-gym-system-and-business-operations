// packages/backend/src/middleware/error.middleware.ts

import { Request, Response, NextFunction } from 'express'

// Map lỗi business → HTTP status
const ERROR_STATUS: Record<string, number> = {
    INVALID_CREDENTIALS: 401,
    PHONE_NUMBER_ALREADY_IN_USE: 409,
    REFRESH_TOKEN_INVALID: 401,
    REFRESH_TOKEN_EXPIRED: 401,
    REFRESH_TOKEN_REUSE_DETECTED: 401,
}

export const errorMiddleware = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction,   // bắt buộc phải có tham số này dù không dùng
): void => {
    const status = ERROR_STATUS[err.message] ?? 500

    // Không lộ lỗi hệ thống ra ngoài
    const message = status === 500
        ? 'Internal server error'
        : err.message

    // Log lỗi hệ thống để debug (status 500)
    if (status === 500) {
        console.error(`[ERROR] ${req.method} ${req.path}`, err)
    }

    res.status(status).json({ message })
}