// packages/backend/src/controllers/v1/checkin.controller.ts

import { Request, Response, NextFunction } from 'express';
import { CheckinService } from '../../services/checkin.services';
import { MemberCheckinRequestDto, ClassCheckinRequestDto, CheckInRequestDto } from '@gym/shared';

export class CheckinController {
    private checkinService = new CheckinService();

    // POST /api/v1/checkin/self
    selfCheckin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const dto = req.body as MemberCheckinRequestDto;

            if (!dto.phone) {

                res.status(400).json({ message: "Vui lòng cung cấp số điện thoại." });
                return;
            }
            const result = await this.checkinService.selfCheckin(dto.phone);
            res.status(200).json(result);
        } catch (error: any) {
            // Bắt lỗi thẻ hết hạn để trả về 400 cho FE hiển thị thông báo
            if (error.message === 'NO_ACTIVE_SUBSCRIPTION') {
                res.status(400).json({ message: "Thẻ đã hết hạn hoặc không hợp lệ." });
            } else if (error.message === 'MEMBER_NOT_FOUND') {
                res.status(404).json({ message: "Không tìm thấy hội viên." });
            } else {
                next(error);
            }
        }
    }

    // POST /api/v1/checkin/class
    classCheckin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const dto = req.body as ClassCheckinRequestDto;

            if (!dto.bookingId) {
                res.status(400).json({ message: "Thiếu thông tin bookingId." });
                return;
            }

            const result = await this.checkinService.classCheckin(dto);
            res.status(200).json(result);
        } catch (error: any) {
            if (error.message === 'BOOKING_ALREADY_PROCESSED') {
                res.status(400).json({ message: "Lớp này đã được checkin hoặc đã huỷ trước đó." });
            } else {
                next(error);
            }
        }
    }

    // POST /api/v1/checkin/pt
    ptCheckin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const dto = req.body as CheckInRequestDto;

            // Validate payload cơ bản
            if (!dto.bookingId || !dto.subscriptionId || !dto.status) {
                res.status(400).json({ message: "Thiếu thông tin bắt buộc (bookingId, subscriptionId, status)." });
                return;
            }

            const result = await this.checkinService.ptCheckin(dto);
            res.status(200).json(result);

        } catch (error: any) {
            switch (error.message) {
                case 'BOOKING_NOT_FOUND':
                case 'SUBSCRIPTION_NOT_FOUND':
                    res.status(404).json({ message: "Không tìm thấy dữ liệu (Booking hoặc Gói tập)." });
                    break;
                case 'BOOKING_ALREADY_PROCESSED'://da bao huy
                    res.status(400).json({ message: "Lịch tập này đã được xử lý trước đó." });
                    break;
                case 'NO_REMAINING_SESSION':
                    res.status(400).json({ message: "Gói tập của hội viên đã hết buổi." });
                    break;
                case 'INVALID_STATUS_TRANSITION':
                    res.status(400).json({ message: "Trạng thái check-in không hợp lệ." });
                    break;
                default:
                    next(error); // Bắn lỗi server (500)
            }
        }
    }

    // GET /api/v1/checkin/history/:subscriptionId
    getHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const subId = Number(req.params.subscriptionId);
            if (!subId) {
                res.status(400).json({ message: "Thiếu subscriptionId" });
                return;
            }

            const history = await this.checkinService.getSubscriptionHistory(subId);
            res.status(200).json(history);
        } catch (error) {
            next(error);
        }
    }

    // GET /api/v1/checkin/logs?date=YYYY-MM-DD
    getLogsByDate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const date = req.query.date as string;

            // Validate nếu frontend quên truyền date
            if (!date) {
                res.status(400).json({ message: "Vui lòng cung cấp tham số ngày (date)." });
                return;
            }

            const logs = await this.checkinService.getLogsByDate(date);
            res.status(200).json(logs);
        } catch (error: any) {
            next(error);
        }
    }
}