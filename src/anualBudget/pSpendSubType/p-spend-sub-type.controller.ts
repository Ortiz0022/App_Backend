import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { PSpendSubTypeService } from './p-spend-sub-type.service';
import { CreatePSpendSubTypeDto } from './dto/create.dto';
import { UpdatePSpendSubTypeDto } from './dto/update.dto';

@Controller('p-spend-sub-type')
export class PSpendSubTypeController {
  constructor(private readonly svc: PSpendSubTypeService) {}

  @Post() create(@Body() dto: CreatePSpendSubTypeDto) { return this.svc.create(dto); }
  @Get() list(@Query('typeId') typeId?: number) {
    return this.svc.findAll(typeId ? Number(typeId) : undefined);
  }
  @Get(':id') one(@Param('id', ParseIntPipe) id: number) { return this.svc.findOne(id); }
  @Patch(':id') update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePSpendSubTypeDto) { return this.svc.update(id, dto); }
  @Delete(':id') remove(@Param('id', ParseIntPipe) id: number) { return this.svc.remove(id); }
}
