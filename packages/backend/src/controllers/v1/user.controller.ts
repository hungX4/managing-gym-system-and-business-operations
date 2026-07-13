// packages/backend/src/controllers/v1/user.controller.ts

import { Request, Response, NextFunction } from 'express';
import { UserService } from '../../services/user.service';
import { MemberSearchRequestDto } from '@gym/shared';
import cloudinary from '../../config/cloudinary';
import { deleteCloudinaryImage } from '../../utils/cloudinary.util';
export class UserController {

    // GET /api/v1/users/search?keyword=abc
    static searchMembers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            // Ép kiểu query theo DTO
            const { keyword } = req.query as unknown as MemberSearchRequestDto;
            const result = await UserService.searchMembers(keyword);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    // GET /api/v1/user/coaches
    static getCoaches = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const result = await UserService.getCoaches();
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    //GET /api/v1/user
    static getAllUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const users = await UserService.getAllUsers();
            res.status(200).json(users);
        } catch (error) {
            next(error);
        }
    }

    //GET /api/v1/user/:id
    static getUserProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const user = await UserService.getUserById(req.params.id as string);
            if (!user) {
                res.status(404).json({ message: "User not found" });
                return;
            }
            res.status(200).json(user);
        } catch (error) {
            next(error);
        }
    }

    //PATCH /api/v1/user/me
    static updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            //console.log("File nhận được từ Multer:", req.file); // Kiểm tra xem có file không
            //console.log("Body nhận được:", req.body);
            const userId = req.user?.sub as string;
            const { fullName, gmail, phone } = req.body;
            const updateData: any = { fullName, gmail, phone };

            if ((req as any).file) {
                //get user
                const currentUser = await UserService.getUserById(userId);
                //xoa anh tren cloudinary
                await deleteCloudinaryImage(currentUser?.avatarId);

                updateData.avatarUrl = req.file?.path;
                updateData.avatarId = req.file?.filename || (req.file as any).public_id;
            }

            // Nếu cả body rỗng và không có file, báo lỗi ngay tránh gọi xuống DB
            if (Object.keys(updateData).length === 0) {
                res.status(400).json({ message: "No data provided for update" });
                return;
            }

            const updatedUser = await UserService.updateUser(userId, updateData);
            res.status(200).json({
                message: "Updated Successfully!!",
                data: updatedUser
            });
        } catch (error) {
            next(error);
        }
    }
}