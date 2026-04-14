import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { MemberSubscription } from "./MemberSubscription";
import { PackageType } from "@gym/shared";

@Entity('package')
export class Package {
    @PrimaryGeneratedColumn()
    packageId: number;

    @Column()
    name: string;

    @Column({ type: 'decimal', precision: 15, scale: 2 })
    price: number;

    @Column()
    type: PackageType;

    @Column()
    totalSession: number;

    @Column()
    durationDays: number;

    @Column({ default: true })
    isActive: boolean;

    @OneToMany(() => MemberSubscription, (sub) => sub.package)
    subscriptions: MemberSubscription[]
}