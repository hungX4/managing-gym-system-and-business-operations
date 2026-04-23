import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User";
import { SalaryStatus } from "@gym/shared";

@Entity('salary')
export class Salary {

    @PrimaryGeneratedColumn()
    salaryId: number;

    @ManyToOne(() => User, (user) => user.salary)
    @JoinColumn({ name: 'employee_id' })
    employee: User;

    @Column()
    month: number;

    @Column()
    year: number;

    @Column({ type: 'decimal', precision: 15, scale: 2 })
    totalWorkIncome: number // tong tien tu work_logs(1-1 and dance class)

    @Column({ type: 'decimal', precision: 15, scale: 2 })
    totalCommission: number; // tong doanh so ban

    @Column({ type: 'decimal', precision: 15, scale: 2 })
    baseSalarySnapshot: number; //luong cung tai thoi diem chot luong

    @Column({ type: 'decimal', nullable: true })
    bonus: number;

    @Column({ type: 'decimal', nullable: true })
    deduction: number;

    @Column({ type: 'decimal' })
    finalAmount: number;

    @Column({ type: 'enum', enum: SalaryStatus })
    status: SalaryStatus;

    @CreateDateColumn({ type: 'datetime' })
    createAt: Date;

    @Column({ type: 'datetime', nullable: true })
    paidAt: Date;
}