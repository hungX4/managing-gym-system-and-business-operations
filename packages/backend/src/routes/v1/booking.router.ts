// packages/backend/src/routes/booking.routes.ts

import { Router } from 'express'
import { BookingController } from '../../controllers/v1/booking.controller'
import { AuthMiddleware } from '../../middleware/auth.middleware'
import { Role } from '@gym/shared'

const bookingRoute = Router()
const bookingCtrl = new BookingController()

// PT tạo lịch hẹn cho khách
bookingRoute.post(
    '/',
    AuthMiddleware.authenticate,
    AuthMiddleware.authorize(Role.COACH, Role.ADMIN),
    bookingCtrl.create,
)

// Lấy danh sách booking theo ngày — staff dùng để biết ca nào cần checkin
bookingRoute.get(
    '/',
    AuthMiddleware.authenticate,
    AuthMiddleware.authorize(Role.STAFF, Role.COACH, Role.ADMIN),
    bookingCtrl.getList,
)

// Lấy chi tiết 1 booking
bookingRoute.get(
    '/:id',
    AuthMiddleware.authenticate,
    AuthMiddleware.authorize(Role.STAFF, Role.COACH, Role.ADMIN),
    bookingCtrl.getById,
)

// Cập nhật status (staff dùng khi checkin hoặc cancel)
bookingRoute.patch(
    '/:id/status',
    AuthMiddleware.authenticate,
    AuthMiddleware.authorize(Role.STAFF, Role.ADMIN),
    bookingCtrl.updateStatus,
)

// PT huỷ lịch (chỉ huỷ được khi còn SCHEDULED)
bookingRoute.delete(
    '/:id',
    AuthMiddleware.authenticate,
    AuthMiddleware.authorize(Role.COACH, Role.ADMIN),
    bookingCtrl.cancel,
)

export default bookingRoute;