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
    LATE_CANCEL = 'LATE_CANCEL'
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

export enum PackageType {
    MEMBERSHIP = 'MEMBERSHIP',
    COACHING = 'COACHING',
    DANCE = 'DANCE'
}

export enum PaymentMethod {
    CASH = 'CASH',                   // Tiền mặt
    BANK_TRANSFER = 'BANK_TRANSFER', // Chuyển khoản
    CREDIT_CARD = 'CREDIT_CARD',     // Quẹt thẻ
    INSTALLMENT = 'INSTALLMENT'      // Trả góp
}

export enum TrialStatus {
    UNCONTACTED = 'UNCONTACTED',
    CONTACTED = 'CONTACTED',
    CONVERTED = 'CONVERTED',
    FAILED = 'FAILED'
}