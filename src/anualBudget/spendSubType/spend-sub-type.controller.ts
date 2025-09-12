import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { SpendSubTypeService } from './spend-sub-type.service';
import { CreateSpendSubTypeDto } from './dto/createSpendSubTypeDto';
import { UpdateSpendSubTypeDto } from './dto/updateSpendSubTypeDto';

@Controller('spend-subtype')
export class SpendSubTypeController {
  constructor(private readonly service: SpendSubTypeService) {}

  @Post()
  create(@Body() dto: CreateSpendSubTypeDto) {
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
  update(@Param('id') id: string, @Body() dto: UpdateSpendSubTypeDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
