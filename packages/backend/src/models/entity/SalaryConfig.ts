import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { CoachLevel, CoachType } from "@gym/shared";


@Entity('salary_config')
export class SalaryConfig {
    @PrimaryGeneratedColumn()
    configId: number;

    @Column({ type: 'enum', enum: CoachType })
    coachType: CoachType;

    @Column({ type: 'enum', enum: CoachLevel })
    coachLevel: CoachLevel;

    @Column({ type: 'decimal', precision: 15, scale: 2 })
    baseSalary: number;

    @Column({ type: 'decimal', precision: 15, scale: 2 }) // for dance and yoga coach
    pricePerSession: number;

    @UpdateDateColumn()
    updateDate: Date;
}