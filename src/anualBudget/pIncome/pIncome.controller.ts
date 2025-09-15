// src/anualBudget/income/income.controller.ts
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { PIncomeService } from './pIncome.service';

import { UpdatePIncomeDto } from './dto/updatePIncomeDto';
import { CreatePIncomeDto } from './dto/createPIncomeDto';

@Controller('p-income')
export class PIncomeController {
  constructor(private readonly svc: PIncomeService) {}

  @Post()
  create(@Body() dto: CreatePIncomeDto) {
    return this.svc.create(dto);
  }

  @Get()
  list(@Query('pIncomeSubTypeId') pIncomeSubTypeId?: number) {
    return this.svc.findAll(pIncomeSubTypeId ? Number(pIncomeSubTypeId) : undefined);
  }

  @Get(':id')
  get(@Param('id', ParseIntPipe) id: number) {
    return this.svc.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePIncomeDto) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.svc.remove(id);
  }
}
