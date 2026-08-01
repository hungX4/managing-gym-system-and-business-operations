import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';

export const CloudinaryProvider = {
    provide: 'CLOUDINARY', // Đặt tên cho provider này
    inject: [ConfigService], // Tiêm ConfigService để lấy biến môi trường từ .env
    useFactory: (configService: ConfigService) => {
        return cloudinary.config({
            cloud_name: configService.get<string>('CLOUDINARY_CLOUD_NAME'),
            api_key: configService.get<string>('CLOUDINARY_API_KEY'),
            api_secret: configService.get<string>('CLOUDINARY_API_SECRET'),
        });
    },
};