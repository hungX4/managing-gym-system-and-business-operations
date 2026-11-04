import { Controller, Get, Param, Query } from "@nestjs/common";
import { PostsService } from "./posts.service";
import { QueryPostDto } from "./dto/query-post.dto";

@Controller('posts')
export class PostsController {
    constructor(private readonly postsService: PostsService) { }

    @Get()
    findAll(@Query() query: QueryPostDto) {
        return this.postsService.findAllPublic(query);
    }

    @Get(':slug')
    findOne(@Param('slug') slug: string) {
        return this.postsService.findBySlug(slug);
    }
}