import { Controller, Get, Post, Body, Param, ParseIntPipe, Patch, Delete, Query } from '@nestjs/common';
import { IncomeTypeByDepartmentService } from './income-type-by-department.service';
import { UpdateIncomeTypeByDepartmentDto } from './dto/updateIncomeTypeByDepartmentDto';
import { CreateIncomeTypeByDepartmentDto } from './dto/createIncomeTypeByDepartmentDto';

@Controller('income-type-by-department')
export class IncomeTypeByDepartmentController {
  constructor(private readonly service: IncomeTypeByDepartmentService) {}

  @Post()
  create(@Body() dto: CreateIncomeTypeByDepartmentDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(
    @Query('departmentId') departmentId?: string,
  ) {
    return this.service.findAll(
      departmentId ? Number(departmentId) : undefined,
    );
  }

  // Total del depto en el FY (cálculo en vivo)
  @Get('total')
  total(
    @Query('departmentId') departmentId: string,
  ) {
    return this.service.getTotal(Number(departmentId));
  }


  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateIncomeTypeByDepartmentDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.removeByIncomeType(id);
  }
}
