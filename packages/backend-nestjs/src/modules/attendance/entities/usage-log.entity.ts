import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "src/modules/user/entities/user.entity";
import { MemberSubscription } from "src/modules/subscription/entities/member-subscription.entity";
import { WorkLog } from "./work-log.entity";

@Entity('usage_log')
export class UsageLog {
    @PrimaryGeneratedColumn()
    usageLogId!: number

    @ManyToOne(() => User, (user) => user.usageLogs)
    @JoinColumn({ name: 'member_id' })
    member!: User

    @ManyToOne(() => MemberSubscription, (sub) => sub.usageLogs)
    @JoinColumn({ name: 'subscription_id' })
    subscription!: MemberSubscription;

    @OneToOne(() => WorkLog, (worklog) => worklog.usageLog, { nullable: true })
    @JoinColumn({ name: 'work_log_id' })
    workLog!: WorkLog | null;

    @Column({ type: 'datetime' })
    checkinTime!: Date;
}

//Khiếu nại: log để đối soát ngày giờ.

// Báo cáo: Thống kê giờ cao điểm của phòng tập (Dựa vào checkin_time).

// Kiểm soát: Biết được khách đang sử dụng gói tập nào nhiều nhất để tư vấn bán thêm (Upsell).