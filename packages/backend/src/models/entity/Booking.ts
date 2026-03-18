import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User";
import { BookingStatus, CoachType } from "@gym/shared";
import { WorkLog } from "./Worklog";

@Entity('booking')
export class Booking {
    @PrimaryGeneratedColumn()
    bookingId: number;

    @ManyToOne(() => User, (user) => user.coachBooking)
    @JoinColumn({ name: 'coach_id' })
    coach: User;

    @ManyToOne(() => User, (user) => user.memberBooking)
    @JoinColumn({ name: 'member_id' })
    member: User;

    @Column({ type: 'datetime' })
    startTime: Date;

    @Column({ type: 'datetime' })
    endTime: Date;

    @Column({ type: 'enum', enum: CoachType })
    type: CoachType;

    @Column({ type: 'enum', enum: BookingStatus })
    status: BookingStatus;

    @OneToOne(() => WorkLog, (log) => log.booking)
    workLog: WorkLog;
}