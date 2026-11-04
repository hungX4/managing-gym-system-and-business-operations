import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "../../user/entities/user.entity";

export enum PostCategory {
    NEWS = 'NEWS',
    PROMOTION = 'PROMOTION',
    TRANING = 'TRAINING',
    NUTRITION = 'NUTRITION'
}

export enum PostStatus {
    DRAFT = 'DRAFT',
    PUBLISHED = 'PUBLISHED'
}

@Entity('posts')
@Index(['status', 'publishedAt'])
export class Posts {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ length: 255 })
    title!: string;

    @Column({ length: 255, unique: true })
    slug!: string;

    @Column({ length: 500, type: 'varchar', nullable: true })
    excerpt?: string | null;

    @Column({ type: 'longtext' })
    content!: string;

    @Column({ type: 'varchar', length: 500, nullable: true })
    thumbnail?: string | null;

    @Column({ type: 'varchar', length: 500, nullable: true })
    thumbnailId?: string | null;

    @Column({ type: 'varchar', length: 30, default: PostCategory.NEWS })
    category!: PostCategory;

    @Column({ type: 'varchar', length: 20, default: PostStatus.DRAFT })
    status!: PostStatus;

    @Column({ type: 'varchar', length: 160, nullable: true })
    metaDescription?: string | null;

    @Column({ type: 'datetime', nullable: true })
    publishedAt?: Date | null;

    @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
    author?: User | null;

    @CreateDateColumn()
    createdAt!: Date;
    @UpdateDateColumn()
    updatedAt!: Date;
}