import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToOne, OneToMany } from "typeorm";
import { Role } from "@gym/shared";
import { CoachProfile } from "./CoachProfile";
import { MemberSubscription } from "./MemberSubscription";
import { Booking } from "./Booking";
import { Salary } from "./Salary";
import { WorkLog } from "./Worklog";
import { UsageLog } from "./UsageLog";

@Entity('user')
export class User {
    @PrimaryGeneratedColumn()
    userId: string;

    @Column({ select: false })
    passwordHash: string;

    @Column()
    fullName: string;

    @Column({ nullable: false, unique: true })
    phone: string;

    @Column()
    gmail: string;

    @Column({ type: 'enum', enum: Role, default: Role.MEMBER })
    role: Role;

    @Column({ default: true })
    status: boolean;

    @CreateDateColumn()
    createAt: Date;

    @Column({ nullable: true })
    avartarUrl: string; //link CDN để hiển thị ảnh

    @Column({ nullable: true })
    avartarId: string; //Cloudinary public_id để xóa ảnh

    @OneToOne(() => CoachProfile, (profile) => (profile.user))
    coachProfile: CoachProfile;

    @OneToMany(() => MemberSubscription, (sub) => sub.member)
    boughtSubscriptions: MemberSubscription[];

    @OneToMany(() => MemberSubscription, (sub) => sub.seller)
    soldSubscriptions: MemberSubscription[];

    @OneToMany(() => Booking, (booking) => booking.coach)
    coachBooking: Booking[];

    @OneToMany(() => Booking, (booking) => booking.member)
    memberBooking: Booking[];

    @OneToMany(() => Salary, (salary) => salary.coach)
    salary: Salary[];

    @OneToMany(() => WorkLog, (log) => log.coach)
    workLogs: WorkLog[];

    @OneToMany(() => UsageLog, (log) => log.member)
    usageLogs: UsageLog[];
}