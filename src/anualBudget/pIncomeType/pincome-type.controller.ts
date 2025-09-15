import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { PIncomeTypeService } from './pincome-type.service';
import { CreatePIncomeTypeDto } from './dto/createPIncomeTypeDto';
import { UpdatePIncomeTypeDto } from './dto/updatePIncomeTypeDto';

@Controller('p-income-type')
export class PIncomeTypeController {
  constructor(private readonly svc: PIncomeTypeService) {}

  @Post()
  create(@Body() dto: CreatePIncomeTypeDto) {
    return this.svc.create(dto);
  }

  @Get()
  list() {
    return this.svc.findAll();
  }

  @Get(':id')
  get(@Param('id', ParseIntPipe) id: number) {
    return this.svc.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePIncomeTypeDto) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.svc.remove(id);
  }
}
