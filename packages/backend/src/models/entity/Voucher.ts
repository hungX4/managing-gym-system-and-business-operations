import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('voucher')
export class Voucher {
    @PrimaryGeneratedColumn()
    voucherId: number;

    @Column({ unique: true })
    code: string; // VD: "CHAOHE20", "MEMBERMOI"

    @Column({ type: 'float' })
    discountPercentage: number; // Chỉ dùng %, VD: 10, 20, 50

    @Column({ type: 'date', nullable: true })
    startDate: Date; // Ngày bắt đầu áp dụng

    @Column({ type: 'date', nullable: true })
    endDate: Date; // Ngày hết hạn

    @Column({ type: 'int', default: 0 })
    usageLimit: number; // Giới hạn số lượt dùng (0 là vô hạn)

    @Column({ type: 'int', default: 0 })
    usedCount: number; // Số lượt đã dùng

    @Column({ default: true })
    isActive: boolean; // Công tắc bật/tắt mã khẩn cấp
}