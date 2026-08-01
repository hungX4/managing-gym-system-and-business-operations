import { BadRequestException, Body, Controller, Get, Param, ParseIntPipe, Patch, Query, Req, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { UserService } from "../services/user.service";
import { JwtAuthGuard } from "src/modules/auth/guards/jwt-auth.guard";
import { Roles } from "src/modules/auth/decorator/roles.decorator";
import { Role } from "@gym/shared";
import { RolesGuard } from "src/modules/auth/guards/roles.guad.guard";
import { CloudinaryService } from "src/modules/cloudinary/cloudinary.service";
import { FileInterceptor } from "@nestjs/platform-express";

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('user')
export class UserController {

    constructor(
        private readonly userService: UserService,
        private readonly cloudinaryService: CloudinaryService
    ) { }

    @Get('search')
    async searchMembers(@Query('keyword') keyword: string) {
        return await this.userService.searchMembers(keyword);
    }

    @Roles(Role.ADMIN)
    @Get()
    async getAllUser() {
        return await this.userService.getAllUsers();
    }

    @Get('coaches')
    async getAllCoaches() {
        return await this.userService.getAllCoaches();
    }

    @Get(':id')
    async getUserById(@Param('id') id: string) {
        return await this.userService.getUserById(id);
    }

    @Patch('me')
    @UseInterceptors(FileInterceptor('file'))
    async updateUserProfile(
        @Req() req: Request & { user?: any },
        @Body() body: any,
        @UploadedFile() file: Express.Multer.File
    ) {
        const userId = req.user?.sub as string;
        const { fullName, gmail, phone } = body;
        const updateData: any = { fullName, gmail, phone };
        // console.log(file);
        if (file) {
            const currentUser = await this.userService.getUserById(userId);

            // Xóa ảnh cũ thông qua CloudinaryService thay vì import function trực tiếp[cite: 5, 9]
            await this.cloudinaryService.deleteImage(currentUser?.avatarId);

            // Gán dữ liệu ảnh mới từ Multer (Nếu dùng multer-storage-cloudinary, file sẽ có path và filename)
            updateData.avatarUrl = file.path;
            updateData.avatarId = file.filename || (file as any).public_id;
        }

        if (Object.keys(updateData).length === 0) {
            throw new BadRequestException({ message: "No data provided for update" });
        }

        const updatedUser = await this.userService.updateUser(userId, updateData);
        return {
            message: "Updated Successfully!!",
            data: updatedUser
        };
    }

}