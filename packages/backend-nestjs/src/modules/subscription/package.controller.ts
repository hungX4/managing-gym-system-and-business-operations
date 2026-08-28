import { Controller, Post, Get, Patch, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { PackageService } from './package.service';
import { CreatePackageRequest } from './dto/package.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guad.guard';
import { Roles } from '../auth/decorator/roles.decorator';
import { Role } from '@gym/shared';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('packages') // Khai báo base route tại đây
export class PackageController {
    // Tiêm (Inject) Service vào Controller
    constructor(private readonly packageService: PackageService) { }

    @Post()
    async createPackage(@Body() dto: CreatePackageRequest) {
        console.log("Dữ liệu sau khi qua class-validator:", dto);
        const result = await this.packageService.createPackage(dto);
    }

    @Get()
    async getAllPackages() {
        // NestJS tự động trả về status 200
        return await this.packageService.getAllPackages();
    }

    @Patch(':id/status')
    // ParseIntPipe tự động kiểm tra `:id` có phải số hay không, nếu NaN nó tự ném lỗi 400
    async toggleStatus(@Param('id', ParseIntPipe) packageId: number) {
        return await this.packageService.togglePackageStatus(packageId);
    }
}