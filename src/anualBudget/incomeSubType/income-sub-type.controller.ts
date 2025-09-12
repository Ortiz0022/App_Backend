import { Controller, Get, Post, Body, Param, ParseIntPipe, Patch, Delete, Query } from '@nestjs/common';
import { IncomeSubTypeService } from './income-sub-type.service';
import { CreateIncomeSubTypeDto } from './dto/createIncomeSubTypeDto';
import { UpdateIncomeSubTypeDto } from './dto/updateIncomeSubTypeDto';

@Controller('income-sub-type')
export class IncomeSubTypeController {
  constructor(private readonly service: IncomeSubTypeService) {}

  @Post() create(@Body() dto: CreateIncomeSubTypeDto) { return this.service.create(dto); }

  @Get()
  findAll(@Query('incomeTypeId') incomeTypeId?: string) {
    return this.service.findAll(incomeTypeId ? Number(incomeTypeId) : undefined);
  }

  @Get(':id') findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateIncomeSubTypeDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id') remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }
}
