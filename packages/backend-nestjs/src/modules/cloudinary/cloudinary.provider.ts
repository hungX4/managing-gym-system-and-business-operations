import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';

export const CloudinaryProvider = {
    provide: 'CLOUDINARY', // Đặt tên cho provider này
    inject: [ConfigService], // Tiêm ConfigService để lấy biến môi trường từ .env
    useFactory: (configService: ConfigService) => {
        return cloudinary.config({
            cloud_name: configService.get(process.env.CLOUDINARY_CLOUD_NAME as string),
            api_key: configService.get(process.env.CLOUDINARY_API_KEY as string),
            api_secret: configService.get(process.env.CLOUDINARY_API_SECRET as string),
        });
    },
};