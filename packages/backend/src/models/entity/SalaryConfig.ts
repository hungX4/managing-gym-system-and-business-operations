import { Column, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { CoachLevel, CoachType, Role } from "@gym/shared"; // Import thêm Role

@Entity('salary_config')
export class SalaryConfig {
    @PrimaryGeneratedColumn()
    configId: number;

    // Phân loại cấu hình này là cho STAFF hay COACH
    @Column({ type: 'enum', enum: Role })
    role: Role;

    // Các trường dưới đây cho phép NULL vì STAFF sẽ không có
    @Column({ type: 'enum', enum: CoachType, nullable: true })
    coachType: CoachType | null;

    @Column({ type: 'enum', enum: CoachLevel, nullable: true })
    coachLevel: CoachLevel | null;

    // Lương cứng (Staff, Admin, PT Gym đều cần)
    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
    baseSalary: number;

    // Tiền trên mỗi ca tập (Dành riêng cho Dance/Yoga hoặc PT Gym nếu có)
    // Staff không cần nên có thể để default là 0
    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
    pricePerSession: number;

    @UpdateDateColumn()
    updateDate: Date;
}