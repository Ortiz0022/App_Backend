// src/anualBudget/pSpendType/p-spend-type.controller.ts
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { PSpendTypeService } from './p-spend-type.service';
import { CreatePSpendTypeDto } from './dto/create.dto';
import { UpdatePSpendTypeDto } from './dto/update.dto';

@Controller('p-spend-type')
export class PSpendTypeController {
  constructor(private readonly svc: PSpendTypeService) {}

  @Post() create(@Body() dto: CreatePSpendTypeDto) { return this.svc.create(dto); }

  @Get() list(@Query('departmentId') departmentId?: number) {
    return this.svc.findAll(departmentId ? Number(departmentId) : undefined);
  }

  @Get(':id') one(@Param('id', ParseIntPipe) id: number) { return this.svc.findOne(id); }

  @Patch(':id') update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePSpendTypeDto) {
    return this.svc.update(id, dto);
  }

  @Delete(':id') remove(@Param('id', ParseIntPipe) id: number) { return this.svc.remove(id); }
}
