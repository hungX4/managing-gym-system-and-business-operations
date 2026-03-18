import { MemberSubscriptionStatus } from '../enums';

//request
export interface CreateSubscriptionRequestDto {
    memberId: number,
    packageId: number,
    startDate: Date,
    discount: number,
    actualPaid: number
}

//response
export interface SubscriptionResponseDto {
    subscriptionId: number,
    remainingSession: number,
    startDate: Date,
    endDate: Date,
    discount: number,
    actualPaid: number,
    status: MemberSubscriptionStatus,
    memberId: number,
    sellerId: number,
    packageid: number,
    createAt: Date
}