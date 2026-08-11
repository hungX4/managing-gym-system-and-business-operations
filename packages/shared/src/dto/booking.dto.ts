import { CoachType, BookingStatus } from '../enums'

//request
export interface CreateBookingRequestDto {
    coachId: string,
    memberId: string,
    startTime: Date,
    endTime: Date,
    phone: string,
    type: CoachType //gym, dance, yoga session
}

export interface UpdateBookingStatusDto {
    status: BookingStatus
}

//response

export interface BookingResponseDto {
    bookingId: number,
    coachId: string,
    coachName: string,
    memberId: string,
    memberName: string,
    memberPhone: string,
    startTime: Date,
    endTime: Date,
    type: CoachType,
    status: BookingStatus,
    subscriptionId?: number
}