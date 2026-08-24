import { Controller, Post, Get, Patch, Body, Param, ParseIntPipe } from '@nestjs/common';
import { PackageService } from './package.service';
import { type CreatePackageRequestDto } from '@gym/shared';

@Controller('packages') // Khai báo base route tại đây
export class PackageController {
    // Tiêm (Inject) Service vào Controller
    constructor(private readonly packageService: PackageService) { }

    @Post()
    async createPackage(@Body() dto: CreatePackageRequestDto) {
        console.log("Dữ liệu sau khi qua class-validator:", dto);
        const result = await this.packageService.createPackage(dto);

        // NestJS tự động trả về status 201 cho method POST
        return {
            message: 'Tạo gói tập mới thành công!',
            data: result
        };
    }

    @Get()
    async getAllPackages() {
        // NestJS tự động trả về status 200
        return await this.packageService.getAllPackages();
    }

    @Patch(':id/status')
    // ParseIntPipe tự động kiểm tra `:id` có phải số hay không, nếu NaN nó tự ném lỗi 400
    async toggleStatus(@Param('id', ParseIntPipe) packageId: number) {
        const updatedPackage = await this.packageService.togglePackageStatus(packageId);

        return {
            message: `Đã ${updatedPackage.isActive ? 'mở bán' : 'tạm ngưng'} gói tập!`,
            data: updatedPackage
        };
    }
}