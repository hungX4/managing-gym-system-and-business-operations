import { CoachType, BookingStatus } from '../enums'

//request
export interface CreateBookingRequestDto {
    coach_id: number,
    member_id: number,
    start_time: Date,
    end_time: Date,
    type: CoachType //gym, dance, yoga session
}

export interface UpdateBookingStatusDto {
    status: BookingStatus
}

//response

export interface BookingResponseDto {
    booking_id: number,
    coach_id: number,
    coach_name: string,
    member_id: number,
    member_name: string,
    member_phone: string,
    start_time: Date,
    end_time: Date,
    type: CoachType,
    status: BookingStatus
}