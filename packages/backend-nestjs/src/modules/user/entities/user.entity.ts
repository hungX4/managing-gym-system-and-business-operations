import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToOne, OneToMany } from "typeorm";
import { Role } from "@gym/shared";
import { CoachProfile } from "./coachProfile.entity";
import { MemberSubscription } from "src/modules/subscription/entities/member-subscription.entity";
import { Booking } from "src/modules/booking/entities/booking.entity";
import { Salary } from "src/modules/payroll/entities/salary.entity";
import { WorkLog } from "src/modules/attendance/entities/work-log.entity";
import { UsageLog } from "src/modules/attendance/entities/usage-log.entity";
import { TrialLead } from "src/modules/lead/entities/trial-lead.entity";

@Entity('user')
export class User {
    @PrimaryGeneratedColumn()
    userId!: string;

    @Column({ select: false })
    passwordHash!: string;

    @Column()
    fullName!: string;

    @Column({ nullable: false, unique: true })
    phone!: string;

    @Column()
    gmail!: string;

    @Column({ type: 'enum', enum: Role, default: Role.MEMBER })
    role!: Role;

    @Column({ default: true })
    status!: boolean;

    @CreateDateColumn()
    createAt!: Date;

    @Column({ nullable: true })
    avatarUrl!: string; //link CDN để hiển thị ảnh

    @Column({ nullable: true })
    avatarId!: string; //Cloudinary public_id để xóa ảnh

    @OneToOne(() => CoachProfile, (profile) => (profile.user))
    coachProfile!: CoachProfile;

    @OneToMany(() => MemberSubscription, (sub) => sub.member)
    boughtSubscriptions!: MemberSubscription[];

    @OneToMany(() => MemberSubscription, (sub) => sub.seller)
    soldSubscriptions!: MemberSubscription[];

    @OneToMany(() => Booking, (booking) => booking.coach)
    coachBooking?: Booking[];

    @OneToMany(() => Booking, (booking) => booking.member)
    memberBooking?: Booking[];

    @OneToMany(() => Salary, (salary) => salary.employee)
    salary?: Salary[];

    @OneToMany(() => WorkLog, (log) => log.coach)
    workLogs?: WorkLog[];

    @OneToMany(() => UsageLog, (log) => log.member)
    usageLogs?: UsageLog[];

    @OneToMany(() => TrialLead, (trialLead) => trialLead.assignedTo)
    trialLeads!: TrialLead[];
}