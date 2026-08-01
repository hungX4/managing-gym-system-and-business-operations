import { Module } from "@nestjs/common";
import { UserController } from "./controllers/user.controller";
import { UserService } from "./services/user.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { CoachProfile } from "./entities/coachProfile.entity";
import { MulterModule } from "@nestjs/platform-express";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryModule } from "../cloudinary/cloudinary.module";
@Module({
    imports: [
        TypeOrmModule.forFeature([User, CoachProfile]),
        CloudinaryModule,
        MulterModule.registerAsync({
            imports: [CloudinaryModule],
            inject: ['CLOUDINARY'],
            useFactory: (cloudinaryConfig) => {
                // cloudinary provider đã khởi tạo xong và tự động config api_key
                return {
                    storage: new CloudinaryStorage({
                        cloudinary: cloudinary,
                        params: async (_req, _file) => ({
                            folder: 'gym_avatar',
                            allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
                        }),
                    }),
                };
            },
        }),
    ],
    controllers: [UserController],
    providers: [UserService],
    exports: [UserService],
})

export class UserModule { }