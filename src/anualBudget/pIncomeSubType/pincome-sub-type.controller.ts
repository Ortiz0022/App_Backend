// src/anualBudget/incomeSubType/income-sub-type.controller.ts
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { PIncomeSubTypeService } from './pincome-sub-type.service';
import { CreatePIncomeSubTypeDto } from './dto/createPIncomeSubTypeDto';
import { UpdatePIncomeSubTypeDto } from './dto/updatePIncomeSubTypeDto';

@Controller('p-income-sub-type')
export class PIncomeSubTypeController {
  constructor(private readonly svc: PIncomeSubTypeService) {}

  @Post()
  create(@Body() dto: CreatePIncomeSubTypeDto) {
    return this.svc.create(dto);
  }

  @Get()
  list(@Query('pincomeTypeId') pincomeTypeId?: number) {
    return this.svc.findAll(pincomeTypeId ? Number(pincomeTypeId) : undefined);
  }

  @Get(':id')
  get(@Param('id', ParseIntPipe) id: number) {
    return this.svc.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePIncomeSubTypeDto) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.svc.remove(id);
  }
}
