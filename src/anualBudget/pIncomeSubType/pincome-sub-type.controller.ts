// src/anualBudget/incomeSubType/income-sub-type.controller.ts
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { PIncomeSubTypeService } from './pincome-sub-type.service';
import { CreatePIncomeSubTypeDto } from './dto/createPIncomeSubTypeDto';
import { UpdatePIncomeSubTypeDto } from './dto/updatePIncomeSubTypeDto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';

@Controller('p-income-sub-type')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PIncomeSubTypeController {
  constructor(private readonly svc: PIncomeSubTypeService) {}

  @Post()
  @Roles('ADMIN')
  create(@Body() dto: CreatePIncomeSubTypeDto) {
    return this.svc.create(dto);
  }

  @Get()
  list(@Query('pIncomeTypeId') pIncomeTypeId?: number) {
    return this.svc.findAll(pIncomeTypeId ? Number(pIncomeTypeId) : undefined);
  }

  @Get(':id')
  get(@Param('id', ParseIntPipe) id: number) {
    return this.svc.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePIncomeSubTypeDto) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.svc.remove(id);
  }
}
