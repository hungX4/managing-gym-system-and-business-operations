import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindOptionsWhere, Repository } from "typeorm";
import { Posts, PostStatus } from "./entity/posts.entity";
import sanitizeHtml from 'sanitize-html';
import { toSlug } from "src/common/utils/slug.until";
import { CreatePostDto } from "./dto/create-post.dto";
import { UpdatePostDto } from "./dto/update-post.dto";
import { AdminQueryPostDto } from "./dto/query-post.dto";
import { CloudinaryService } from "../cloudinary/cloudinary.service";
@Injectable()
export class PostsService {
    constructor(
        @InjectRepository(Posts)
        private readonly postRepo: Repository<Posts>,

        private readonly cloudinaryService: CloudinaryService
    ) { }

    private sanitize(html: string): string {
        return sanitizeHtml(html, {
            allowedTags: ['p', 'h2', 'h3', 'b', 'strong', 'i', 'em', 'u', 'ul', 'ol', 'li', 'a', 'img', 'br', 'blockquote'],
            allowedAttributes: { a: ['href', 'target', 'rel'], img: ['src', 'alt'] },
            allowedSchemes: ['http', 'https'], // chặn javascript:
        });
    }

    private async generateUniqueSlug(title: string): Promise<string> {
        const base = toSlug(title) || 'bai-viet';
        let slug = base;
        let i = 2;
        while (await this.postRepo.exists({ where: { slug } })) {
            slug = `${base}-${i++}`
        }
        return slug;
    }

    //admin
    async create(dto: CreatePostDto, authorId: string, thumbnail: Express.Multer.File) {
        try {
            const post = this.postRepo.create({
                ...dto,
                content: this.sanitize(dto.content),
                slug: await this.generateUniqueSlug(dto.title),
                publishedAt: dto.status === 'PUBLISHED' ? new Date() : null,
                author: { userId: authorId },
                ...(thumbnail && {
                    thumbnail: thumbnail.path,
                    thumbnailId: thumbnail.filename
                })
            })
            return this.postRepo.save(post);
        }
        catch (err) {
            if (thumbnail) await this.cloudinaryService.deleteImage(thumbnail.fieldname).catch(() => { });
            throw new Error;
        }
    }

    async update(id: number, dto: UpdatePostDto, thumbnail?: Express.Multer.File) {
        try {
            const post = await this.postRepo.findOne({
                where: { id }
            });
            if (!post) throw new NotFoundException('CANNOT_FIND_POST');
            const oldThumbId = post.thumbnailId;

            if (dto.content) dto.content = this.sanitize(dto.content);
            Object.assign(post, dto);

            if (thumbnail) {
                post.thumbnail = thumbnail.path;
                post.thumbnailId = thumbnail.filename;
            }

            if (post.status === PostStatus.PUBLISHED && !post.publishedAt) post.publishedAt = new Date();

            const saved = this.postRepo.save(post);

            if (thumbnail && oldThumbId) {
                this.cloudinaryService.deleteImage(oldThumbId).catch(() => { console.log('CLOUDINARY_IMAGE_DELETE_ERROR') });
            }

            return saved;
        } catch (err) {
            if (thumbnail) await this.cloudinaryService.deleteImage(thumbnail.filename).catch(() => { });
            throw err;
        }
    }

    async remove(id: number) {
        const result = await this.postRepo.delete(id);
        if (!result.affected) throw new NotFoundException('CANNOT_FIND_POST');
        return {
            deleted: true
        }
    }

    async findOneById(id: number) {
        const post = await this.postRepo.findOne({ where: { id } });
        if (!post) throw new NotFoundException('Không tìm thấy bài viết');
        return post;
    }

    //admin
    async findAllAdmin(query: AdminQueryPostDto) {
        const { page, limit, category, status, search } = query;
        const where: FindOptionsWhere<Posts> = {}
        if (category) where.category = category;
        if (status) where.status = status;
        if (search) where.title = search;

        return this.paginate(where, page, limit, 'createdAt', true);
    }

    //public
    async findAllPublic(query: AdminQueryPostDto) {
        const { page, limit, category, search } = query;
        const where: FindOptionsWhere<Posts> = {}
        if (category) where.category = category;
        if (search) where.title = search;

        return this.paginate(where, page, limit, 'publishedAt', false);
    }

    async findBySlug(slug: string) {
        const post = await this.postRepo.findOne({
            where: { slug, status: PostStatus.PUBLISHED },
        });
        if (!post) throw new NotFoundException('Không tìm thấy bài viết');
        return post;
    }

    private async paginate(
        where: FindOptionsWhere<Posts>,
        page,
        limit,
        orderBy: 'createdAt' | 'publishedAt',
        includeStatus: boolean
    ) {
        const [items, total] = await this.postRepo.findAndCount({
            where,
            order: { [orderBy]: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
            select: {
                id: true, title: true, slug: true, excerpt: true, thumbnail: true,
                category: true, publishedAt: true, createdAt: true,
                ...(includeStatus && { status: true }),
            },
        });
        return {
            items,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        }
    }
}
