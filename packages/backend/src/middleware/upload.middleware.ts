import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary";
import multer from "multer";

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (_req, _file) => ({
        folder: "gym_avatar",
        allowed_format: ['jpg', 'png', 'jpeg', 'webp']
    })
});

export const upload = multer({ storage });