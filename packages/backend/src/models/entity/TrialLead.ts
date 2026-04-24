// entity/TrialLead.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { TrialStatus } from '@gym/shared';
import { User } from './User'; // Entity User hiện tại của bạn

@Entity('trial_leads')
export class TrialLead {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 100 })
    fullName: string;

    @Column({ length: 15 })
    phoneNumber: string;

    @Column({ length: 100, nullable: true })
    email: string;

    @Column({ type: 'enum', enum: TrialStatus, default: TrialStatus.UNCONTACTED })
    status: TrialStatus;

    @Column({ type: 'text', nullable: true })
    guestNote: string; // Ghi chú từ khách hàng lúc điền form

    @Column({ type: 'text', nullable: true })
    adminNote: string; // Ghi chú quá trình chăm sóc của Sales/Staff

    // Người phụ trách chăm sóc (Có thể null nếu chưa ai nhận)
    @ManyToOne(() => User, (assignedTo) => assignedTo.trialLeads, { nullable: true })
    @JoinColumn({ name: 'assigned_to_id' })
    assignedTo: User | null;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}