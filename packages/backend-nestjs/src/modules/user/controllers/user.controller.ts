import { Controller, Get, Param, ParseIntPipe, Query, UseGuards } from "@nestjs/common";
import { UserService } from "../services/user.service";
import { JwtAuthGuard } from "src/modules/auth/guards/jwt-auth.guard";
import { Roles } from "src/modules/auth/guards/roles.decorator.guard";
import { Role } from "@gym/shared";
import { RolesGuard } from "src/modules/auth/guards/roles.guad.guard";

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('user')
export class UserController {

    constructor(private readonly userService: UserService) { }

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


}