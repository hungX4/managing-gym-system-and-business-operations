import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guad.guard";
import { Roles } from "../auth/decorator/roles.decorator";
import { Role } from "@gym/shared";
import { PostsService } from "./posts.service";
import { CreatePostDto } from "./dto/create-post.dto";
import { CurrentUser } from "../user/decorator/user.decorator";
import { AdminQueryPostDto } from "./dto/query-post.dto";
import { UpdatePostDto } from "./dto/update-post.dto";
import { FileInterceptor } from "@nestjs/platform-express";

// admin-posts.controller.ts
@Controller('admin/posts')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminPostsController {
    constructor(private readonly postsService: PostsService) { }

    @Post()
    @UseInterceptors(FileInterceptor('thumbnail'))
    create(
        @Body() dto: CreatePostDto,
        @UploadedFile() thumbnail: Express.Multer.File,
        @CurrentUser('sub') authorId: string
    ) {
        return this.postsService.create(dto, authorId, thumbnail);
    }

    @Get()
    findAll(@Query() query: AdminQueryPostDto) {
        return this.postsService.findAllAdmin(query);
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.postsService.findOneById(id);
    }

    @Patch(':id')
    @UseInterceptors(FileInterceptor('thumbnail'))
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdatePostDto,
        @UploadedFile() thumbnail: Express.Multer.File
    ) {
        console.log(thumbnail)
        return this.postsService.update(id, dto, thumbnail);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.postsService.remove(id);
    }
}