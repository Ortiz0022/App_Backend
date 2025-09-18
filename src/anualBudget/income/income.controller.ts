// src/anualBudget/income/income.controller.ts
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { IncomeService } from './income.service';
import { CreateIncomeDto } from './dto/createIncomeDto';
import { UpdateIncomeDto } from './dto/updateIncomeDto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';

@Controller('income')
@UseGuards(JwtAuthGuard, RolesGuard)
export class IncomeController {
  constructor(private readonly svc: IncomeService) {}

  @Post()
  @Roles('ADMIN')
  create(@Body() dto: CreateIncomeDto) {
    return this.svc.create(dto);
  }

  @Get()
  list(@Query('incomeSubTypeId') incomeSubTypeId?: number) {
    return this.svc.findAll(incomeSubTypeId ? Number(incomeSubTypeId) : undefined);
  }

  @Get(':id')
  get(@Param('id', ParseIntPipe) id: number) {
    return this.svc.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateIncomeDto) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.svc.remove(id);
  }
}
