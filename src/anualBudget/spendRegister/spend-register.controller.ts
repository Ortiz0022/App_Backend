import { Controller, Get, Post, Body, Param, ParseIntPipe, Patch, Delete, Query } from '@nestjs/common';
import { SpendRegisterService } from './spend-register.service';
import { CreateSpendRegisterDto } from './dto/createSpendRegisterDto';
import { UpdateSpendRegisterDto } from './dto/updateSpendRegisterDto';

@Controller('spend-register')
export class SpendRegisterController {
  constructor(private readonly service: SpendRegisterService) {}

  @Post()
  create(@Body() dto: CreateSpendRegisterDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query('categoryId') categoryId?: string) {
    return this.service.findAll(categoryId ? Number(categoryId) : undefined);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSpendRegisterDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
