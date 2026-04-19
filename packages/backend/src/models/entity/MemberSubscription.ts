import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { MemberSubscriptionStatus, PaymentMethod } from "@gym/shared";
import { Package } from "./Package";
import { User } from "./User";
import { UsageLog } from "./UsageLog";

@Entity('member_subscription')
export class MemberSubscription {
    @PrimaryGeneratedColumn()
    subscriptionId: number;

    @ManyToOne(() => User, (user) => user.boughtSubscriptions)
    @JoinColumn({ name: 'member_id' })
    member: User;

    @ManyToOne(() => User, (user) => user.soldSubscriptions)
    @JoinColumn({ name: 'seller_id' })
    seller: User | null;

    @ManyToOne(() => Package, (pkg) => pkg.subscriptions)
    @JoinColumn({ name: 'package_id' })
    package: Package

    @Column()
    remainingSession: number;

    @Column({ type: 'date' })
    startDate: Date;

    @Column({ type: 'date' })
    endDate: Date;

    @Column({ type: 'float', default: 0 })
    discount: number;

    @Column({ type: 'decimal', default: 0 })
    actualPaid: number;

    @Column({ type: 'enum', enum: PaymentMethod, nullable: true })
    paymentMethod: PaymentMethod; // Có thể null nếu khách mua Online qua cổng thanh toán khác, hoặc set cứng sau

    @Column({ type: 'varchar', nullable: true })
    appliedVoucherCode: string | null; // Lưu lại mã Voucher khách đã dùng (nếu có)

    @Column({ type: 'enum', enum: MemberSubscriptionStatus })
    status: MemberSubscriptionStatus;

    @CreateDateColumn()
    createdAt: Date;

    @OneToMany(() => UsageLog, (log) => log.subscription)
    usageLogs: UsageLog[];
}