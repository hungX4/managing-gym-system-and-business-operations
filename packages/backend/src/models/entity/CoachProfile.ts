import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { CoachLevel, CoachType } from "@gym/shared";
import { User } from "./User";


@Entity('coach_profile')
export class CoachProfile {
    @PrimaryGeneratedColumn()
    profileId: number;

    @Column({ type: 'enum', enum: CoachType })
    type: CoachType;

    @Column({ type: 'enum', enum: CoachLevel })
    level: CoachLevel;

    @Column({ type: 'text', nullable: true })
    bio: string;

    @OneToOne(() => User, (user) => (user.coachProfile))
    @JoinColumn({ name: 'user_id' })
    user: User;
}