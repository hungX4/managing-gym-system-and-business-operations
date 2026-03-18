export enum Role {
    ADMIN = 'ADMIN',
    STAFF = 'STAFF',
    COACH = 'COACH',
    MEMBER = 'MEMBER'
}

export enum CoachType {
    GYM = 'GYM',
    DANCE = 'DANCE',
    YOGA = 'YOGA'
}

export enum CoachLevel {
    JUNIOR = 'JUNIOR',
    SENIOR = 'SENIOR',
    MASTER = 'MASTER'
}

export enum BookingStatus {
    CONFIRMED = 'CONFIRMED',
    CANCELLED = 'CANCELLED',
    COMPLETED = 'COMPLETED',
}

export enum WorkLogStatus {
    COMPLETED = 'COMPLETED',
    LATE_CANCEL = 'LATE_CANCEL'
}

export enum SalaryStatus {
    ESTIMATED = "ESTIMATED",
    PENDING = 'PENDING',
    PAID = 'PAID'
}

export enum MemberSubscriptionStatus {
    ACTIVE = 'ACTIVE',
    EXPIRATED = 'EXPIRATED',
    RESERVE = 'RESERVE'
}