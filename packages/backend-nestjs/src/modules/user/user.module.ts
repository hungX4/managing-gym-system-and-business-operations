import { Module } from "@nestjs/common";
import { UserController } from "./controllers/user.controller";
import { UserService } from "./services/user.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { CoachProfile } from "./entities/coachProfile.entity";
import { MulterModule } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
import { CloudinaryService } from "../cloudinary/cloudinary.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([User, CoachProfile]),
        MulterModule.register({
            storage: memoryStorage(),
            limits: {
                fileSize: 5 * 1024 * 1024, // Giới hạn file 5MB
            },
        }),
    ],
    controllers: [UserController],
    providers: [UserService, CloudinaryService],
    exports: [UserService],
})

export class UserModule { }