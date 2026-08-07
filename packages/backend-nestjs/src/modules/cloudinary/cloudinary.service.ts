// src/modules/cloudinary/cloudinary.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
    private readonly logger = new Logger(CloudinaryService.name);

    async deleteImage(publicId: string | null | undefined): Promise<any> {
        if (!publicId || publicId === 'avatar' || publicId.includes('default')) {
            return null;
        }

        this.logger.debug(cloudinary.config().cloud_name);
        try {
            const result = await cloudinary.uploader.destroy(publicId, { invalidate: true });
            //this.logger.log(`Kết quả xoá ảnh ${publicId}:`, result);
            return result;
        } catch (error) {
            this.logger.error(`Lỗi khi xoá ảnh ${publicId} trên Cloudinary!`, error);
            return null;
        }
    }
}