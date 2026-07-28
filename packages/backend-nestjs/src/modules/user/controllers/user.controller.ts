import { Controller, Get, Param, ParseIntPipe, Query } from "@nestjs/common";
import { UserService } from "../services/user.service";

@Controller('user')
export class UserController {

    constructor(private readonly userService: UserService) { }

    @Get('search')
    async searchMembers(@Query('keyword') keyword: string) {
        return await this.userService.searchMembers(keyword);
    }

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