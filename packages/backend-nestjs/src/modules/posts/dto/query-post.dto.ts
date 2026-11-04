import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from "class-validator";
import { PostCategory, PostStatus } from "../entity/posts.entity";

export class QueryPostDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(12)
    limit: number = 12;

    @IsOptional()
    @IsEnum(PostCategory)
    category?: PostCategory

    @IsOptional()
    @IsString()
    search?: string;
}

export class AdminQueryPostDto extends QueryPostDto {
    @IsOptional()
    @IsEnum(PostStatus)
    status?: PostStatus;
}