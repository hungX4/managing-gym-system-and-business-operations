// packages/backend/src/controllers/v1/booking.controller.ts

import { Request, Response, NextFunction } from 'express'
import { BookingService } from '../../services/booking.services'
import { BookingStatus } from '@gym/shared'
import type {
    CreateBookingRequestDto,
    UpdateBookingStatusDto,
} from '@gym/shared'

const ERROR_STATUS: Record<string, number> = {
    COACH_NOT_FOUND: 404,
    MEMBER_NOT_FOUND: 404,
    BOOKING_NOT_FOUND: 404,
    USER_IS_NOT_COACH: 400,
    USER_IS_NOT_MEMBER: 400,
    COACH_TYPE_MISMATCH: 400,
    COACH_SCHEDULE_CONFLICT: 409,
    BOOKING_ALREADY_PROCESSED: 400,
    INVALID_STATUS_TRANSITION: 400,
    FORBIDDEN_NOT_YOUR_BOOKING: 403,
}

export class BookingController {
    private bookingService = new BookingService()

    // POST /api/v1/bookings
    create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const dto = req.body as CreateBookingRequestDto
            const requesterId = req.user!.sub as unknown as string
            const result = await this.bookingService.create(dto, requesterId)
            res.status(201).json(result)
        } catch (err) {
            next(err)
        }
    }

    // GET /api/v1/bookings?date=2024-01-01&coachId=1&status=CONFIRM
    getList = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { date, coachId, memberId, status } = req.query
            const result = await this.bookingService.getList({
                date: date as string | undefined,
                coachId: coachId ? Number(coachId) : undefined,
                memberId: memberId ? Number(memberId) : undefined,
                status: status ? (status as BookingStatus) : undefined,
            })
            res.json(result)
        } catch (err) {
            next(err)
        }
    }

    // GET /api/v1/bookings/:id
    getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const result = await this.bookingService.getById(Number(req.params.id))
            res.json(result)
        } catch (err) {
            next(err)
        }
    }

    // PATCH /api/v1/bookings/:id/status
    updateStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const dto = req.body as UpdateBookingStatusDto
            const result = await this.bookingService.updateStatus(Number(req.params.id), dto)
            res.json(result)
        } catch (err) {
            next(err)
        }
    }

    // DELETE /api/v1/bookings/:id
    cancel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const requesterId = req.user!.sub as unknown as number
            await this.bookingService.cancel(Number(req.params.id), requesterId)
            res.json({ success: true, message: 'Booking đã huỷ' })
        } catch (err) {
            next(err)
        }
    }
}