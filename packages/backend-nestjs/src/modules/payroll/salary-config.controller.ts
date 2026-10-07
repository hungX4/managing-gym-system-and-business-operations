// src/modules/salary/salary-config.controller.ts
import { Controller, Get, Put, Body } from '@nestjs/common';
import { SalaryConfigService } from './salary-config.service';
import { UpdateSalaryConfigDto } from './dto/salary.dto';

@Controller('salary-config')
export class SalaryConfigController {
    constructor(private readonly salaryConfigService: SalaryConfigService) { }

    // GET /salary-config
    @Get()
    async getAllConfigs() {
        return await this.salaryConfigService.getAllConfigs();
    }

    // PUT /salary-config
    @Put()
    async updateConfigs(@Body() dto: UpdateSalaryConfigDto) {
        return await this.salaryConfigService.updateConfigs(dto);
    }
}