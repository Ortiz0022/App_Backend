import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { PSpendTypeByDepartmentService } from './p-spend-type-by-department.service';
import { CreatePSpendTypeByDepartmentDto } from './dto/create.dto';
import { UpdatePSpendTypeByDepartmentDto } from './dto/update.dto';

@Controller('p-spend-type-by-department')
export class PSpendTypeByDepartmentController {
  constructor(private readonly svc: PSpendTypeByDepartmentService) {}

  @Post() create(@Body() dto: CreatePSpendTypeByDepartmentDto) { return this.svc.create(dto); }
  @Get() list(@Query('departmentId') departmentId?: number) {
    return this.svc.findAll(departmentId ? Number(departmentId) : undefined);
  }
  @Get(':id') one(@Param('id', ParseIntPipe) id: number) { return this.svc.findOne(id); }
  @Patch(':id') update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePSpendTypeByDepartmentDto) {
    return this.svc.update(id, dto);
  }
  @Delete(':id') remove(@Param('id', ParseIntPipe) id: number) { return this.svc.remove(id); }
}
