import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { SpendSubTypeService } from './spend-sub-type.service';
import { CreateSpendSubTypeDto } from './dto/createSpendSubTypeDto';
import { UpdateSpendSubTypeDto } from './dto/updateSpendSubTypeDto';

@Controller('spend-sub-type')
export class SpendSubTypeController {
  constructor(private readonly svc: SpendSubTypeService) {}

  @Post()
  create(@Body() dto: CreateSpendSubTypeDto) {
    return this.svc.create(dto);
  }

  @Get()
  list(@Query('spendTypeId') spendTypeId?: number) {
    return this.svc.findAll(spendTypeId ? Number(spendTypeId) : undefined);
  }

  @Get(':id')
  get(@Param('id', ParseIntPipe) id: number) {
    return this.svc.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSpendSubTypeDto) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.svc.remove(id);
  }
}
