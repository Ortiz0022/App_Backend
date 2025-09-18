// src/anualBudget/incomeSubType/income-sub-type.controller.ts
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { IncomeSubTypeService } from './income-sub-type.service';
import { CreateIncomeSubTypeDto } from './dto/createIncomeSubTypeDto';
import { UpdateIncomeSubTypeDto } from './dto/updateIncomeSubTypeDto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';

@Controller('income-sub-type')
@UseGuards(JwtAuthGuard, RolesGuard)
export class IncomeSubTypeController {
  constructor(private readonly svc: IncomeSubTypeService) {}

  @Post()
  @Roles('ADMIN')
  create(@Body() dto: CreateIncomeSubTypeDto) {
    return this.svc.create(dto);
  }

  @Get()
  list(@Query('incomeTypeId') incomeTypeId?: number) {
    return this.svc.findAll(incomeTypeId ? Number(incomeTypeId) : undefined);
  }

  @Get(':id')
  get(@Param('id', ParseIntPipe) id: number) {
    return this.svc.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateIncomeSubTypeDto) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.svc.remove(id);
  }
}
