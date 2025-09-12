// src/anualBudget/departmentSum/department-sum.controller.ts
import { Controller, Get, Post, Param, Body, Delete } from '@nestjs/common';
import { DepartmentSumService } from './department-sum.service';
import { CreateDepartmentSumDto } from './dto/createDepartmentSum';

@Controller('department-sum')
export class DepartmentSumController {
  constructor(private readonly svc: DepartmentSumService) {}

  // Crea o actualiza el snapshot para un año fiscal
  @Post()
  upsert(@Body() dto: CreateDepartmentSumDto) {
    return this.svc.upsert(dto);
  }

  // Recalcula explícitamente para un FY
  @Post('recalc/:fiscalYearId')
  recalc(@Param('fiscalYearId') fiscalYearId: string) {
    return this.svc.recalc(+fiscalYearId);
  }

  // Lista todos los snapshots
  @Get()
  findAll() {
    return this.svc.findAll();
  }

  // Obtiene el snapshot por FY
  @Get('fiscal-year/:fiscalYearId')
  findOneByFY(@Param('fiscalYearId') fiscalYearId: string) {
    return this.svc.findOneByFiscalYear(+fiscalYearId);
  }

  // Elimina un snapshot
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.svc.remove(+id);
  }
}
