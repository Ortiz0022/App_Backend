import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { SpendTypeService } from './spend-type.service';
import { CreateSpendTypeDto } from './dto/createSpendTypeDto';
import { UpdateSpendTypeDto } from './dto/updateSpendTypeDto';

@Controller('spend-type')
export class SpendTypeController {
  constructor(private readonly service: SpendTypeService) {}

  @Post()
  create(@Body() dto: CreateSpendTypeDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSpendTypeDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }

  // opcional: endpoint para forzar recálculo manual
  @Post(':id/recalc')
  recalc(@Param('id') id: string) {
    return this.service.recalcAmount(+id);
  }
}
