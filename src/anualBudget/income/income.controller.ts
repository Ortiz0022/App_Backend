import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { IncomeService } from './income.service';
import { CreateIncomeDto } from './dto/createIncomeDto';
import { UpdateIncomeDto } from './dto/updateIncomeDto';

@Controller('income')
export class IncomeController {
  constructor(private readonly svc: IncomeService) {}

  @Post()
  create(@Body() dto: CreateIncomeDto) {
    return this.svc.create(dto);
  }

  // GET /income?incomeSubTypeId=123
  @Get()
  list(@Query('incomeSubTypeId') incomeSubTypeId?: string) {
    return this.svc.findAll(incomeSubTypeId ? Number(incomeSubTypeId) : undefined);
  }

  @Get(':id')
  get(@Param('id', ParseIntPipe) id: number) {
    return this.svc.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateIncomeDto) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.svc.remove(id);
  }
}
