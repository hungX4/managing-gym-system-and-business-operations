import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Booking } from "./Booking";
import { User } from "./User";
import { WorkLogStatus } from "@gym/shared";
import { UsageLog } from "./UsageLog";

@Entity('work_log')
export class WorkLog {
    @PrimaryGeneratedColumn()
    workLogId: number;

    @ManyToOne(() => User, (user) => user.workLogs)
    @JoinColumn({ name: 'coach_id' })
    coach: User;

    @OneToOne(() => Booking, (booking) => booking.workLog, { nullable: true })
    @JoinColumn({ name: 'booking_id' })
    booking: Booking | null;

    @Column({ type: 'decimal' })
    earnAmount: number; //for dance and yoga coach, save at checkin time

    @Column({ type: 'datetime' })
    checkinTime: Date;

    @Column({ type: 'enum', enum: WorkLogStatus })
    status: WorkLogStatus; //van tinh luong cho coach neu late cancel

    @OneToOne(() => UsageLog, (usage) => usage.workLog)
    usageLog: UsageLog;
}