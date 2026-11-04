import { Transform } from "class-transformer";
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUrl, MaxLength } from "class-validator";
import { PostCategory, PostStatus } from "../entity/posts.entity";

export class CreatePostDto {
    @Transform(({ value }) => (typeof value === 'string') ? value.trim() : value)
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    title!: string;

    @IsString()
    @IsNotEmpty()
    content!: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    excerpt?: string;

    @IsOptional()
    @IsString()
    @MaxLength(160)
    metaDescription?: string;

    @IsEnum(PostCategory)
    category!: PostCategory;

    @IsEnum(PostStatus)
    status!: PostStatus;
}