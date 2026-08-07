import { BadRequestException, Body, Controller, Get, Param, ParseIntPipe, Patch, Query, Req, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { UserService } from "../services/user.service";
import { JwtAuthGuard } from "src/modules/auth/guards/jwt-auth.guard";
import { Roles } from "src/modules/auth/decorator/roles.decorator";
import { Role } from "@gym/shared";
import { RolesGuard } from "src/modules/auth/guards/roles.guad.guard";
import { CloudinaryService } from "src/modules/cloudinary/cloudinary.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { CurrentUser } from "../decorator/user.decorator";

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
        @CurrentUser('sub') userId: string,
        @Body() body: any,
        @UploadedFile() file: Express.Multer.File
    ) {
        const { fullName, gmail, phone } = body;
        const updateData: any = { fullName, gmail, phone };
        // console.log(file);
        if (file) {
            const currentUser = await this.userService.getUserById(userId);

            // Xóa ảnh cũ thông qua CloudinaryService 
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

    // GET /api/v1/coaches/me (Dùng cho Coach xem profile của chính mình)
    @Get('coach/me')
    async getCoachProfile(@Req() req: any) {
        const userId = req.user?.sub;
        return await this.userService.getCoachProfile(userId);
    }

    // PUT /api/v1/coaches/me (Dùng cho Coach tự cập nhật thông tin)
    @Patch('coach/me')
    @UseInterceptors(FileInterceptor('file')) // NestJS Multer Interceptor
    async updateCoachProfile(
        @CurrentUser('sub') userId: string,
        @Body() body: { fullName?: string; phone?: string; bio?: string },
        @UploadedFile() file: Express.Multer.File,
    ) {
        const { fullName, phone, bio } = body;

        const updateData: any = { fullName, phone, bio };

        // Xử lý file upload
        if (file) {
            const currentCoach = await this.userService.getUserById(userId);

            await this.cloudinaryService.deleteImage(currentCoach?.avatarId);

            // (Lưu ý: thuộc tính filename hay path phụ thuộc vào Multer Storage configuration của bạn)
            updateData.avatarUrl = file.path;
            updateData.avatarId = file.filename;
        }

        const result = await this.userService.updateMyProfile(userId, updateData);

        return {
            message: 'Cập nhật thông tin cá nhân thành công!',
            data: result,
        };
    }

}