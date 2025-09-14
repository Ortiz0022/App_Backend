import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { SpendService } from './spend.service';
import { CreateSpendDto } from './dto/createSpendDto';
import { UpdateSpendDto } from './dto/updateSpendDto';

@Controller('spend')
export class SpendController {
  constructor(private readonly svc: SpendService) {}

  @Post()
  create(@Body() dto: CreateSpendDto) {
    return this.svc.create(dto);
  }

  @Get()
  list(@Query('spendSubTypeId') spendSubTypeId?: number) {
    return this.svc.findAll(spendSubTypeId ? Number(spendSubTypeId) : undefined);
  }

  @Get(':id')
  get(@Param('id', ParseIntPipe) id: number) {
    return this.svc.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSpendDto) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.svc.remove(id);
  }
}
