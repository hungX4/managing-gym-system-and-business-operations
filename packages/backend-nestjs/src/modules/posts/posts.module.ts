import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Posts } from "./entity/posts.entity";
import { PostsController } from "./public-posts.controller";
import { AdminPostsController } from "./admin-posts.controller";
import { PostsService } from "./posts.service";
import { CloudinaryModule } from "../cloudinary/cloudinary.module";
import { MulterModule } from "@nestjs/platform-express";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from 'cloudinary';
// posts.module.ts
@Module({
    imports: [
        TypeOrmModule.forFeature([Posts]),
        CloudinaryModule,
        MulterModule.registerAsync({
            imports: [CloudinaryModule],
            inject: ['CLOUDINARY'],
            useFactory: () => ({
                storage: new CloudinaryStorage({
                    cloudinary,
                    params: async () => ({
                        folder: 'gym_posts',
                        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
                    }),
                }),
                limits: { fileSize: 5 * 1024 * 1024 },
            }),
        }),
    ],
    controllers: [PostsController, AdminPostsController],
    providers: [PostsService],
})
export class PostsModule { }