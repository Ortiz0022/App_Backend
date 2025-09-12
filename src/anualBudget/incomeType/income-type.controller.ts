import { Controller, Get, Post, Body, Param, ParseIntPipe, Patch, Delete } from '@nestjs/common';
import { IncomeTypeService } from './income-type.service';
import { CreateIncomeTypeDto } from './dto/createIncomeTypeDto';
import { UpdateIncomeTypeDto } from './dto/updateIncomeTypeDto';

@Controller('income-type')
export class IncomeTypeController {
  constructor(private readonly service: IncomeTypeService) {}

  @Post() create(@Body() dto: CreateIncomeTypeDto) { return this.service.create(dto); }
  @Get() findAll() { return this.service.findAll(); }
  @Get(':id') findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }
  @Patch(':id') update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateIncomeTypeDto) {
    return this.service.update(id, dto);
  }
  @Delete(':id') remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }
}
