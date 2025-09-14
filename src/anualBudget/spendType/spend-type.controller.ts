import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
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
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSpendTypeDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
