// src/modules/salary/salary.controller.ts
import { Controller, Get, Post, Patch, Query, Body, Param, ParseIntPipe } from '@nestjs/common';
import { SalaryService } from './salary.service';
import { GetSalaryQueryDto, FinalizeSalaryDto, GetSalaryDetailQueryDto } from './dto/salary.dto';

@Controller('salary')
export class SalaryController {
    constructor(private readonly salaryService: SalaryService) { }

    // GET /salary
    @Get()
    async getSalaries(@Query() query: GetSalaryQueryDto) {
        return await this.salaryService.calculateSalary(query);
    }

    // POST /salary/finalize
    @Post('finalize')
    async finalizeSalary(@Body() dto: FinalizeSalaryDto) {
        return await this.salaryService.finalizeSalary(dto);
    }

    // PATCH /salary/:id/pay
    @Patch(':id/pay')
    async paySalary(@Param('id', ParseIntPipe) salaryId: number) {
        return await this.salaryService.paySalary(salaryId);
    }

    // GET /salary/details
    @Get('details')
    async getSalaryDetails(@Query() query: GetSalaryDetailQueryDto) {
        return await this.salaryService.getSalaryDetails(query);
    }
}