// src/anualBudget/incomeTypeByDeparment/income-type-by-department.controller.ts
import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { IncomeTypeByDepartmentService } from './income-type-by-department.service';

@Controller('income-type-by-department')
export class IncomeTypeByDepartmentController {
  constructor(private readonly svc: IncomeTypeByDepartmentService) {}


  @Get('sync')
  sync(@Query('fiscalYearId') fiscalYearId: string) {
    return this.svc.recalcAllForFiscalYear(Number(fiscalYearId));
  }

  // Lista snapshots por año fiscal
  // GET /income-type-by-department/by-fy/1
  @Get('by-fy/:fiscalYearId')
  byFY(@Param('fiscalYearId', ParseIntPipe) fiscalYearId: number) {
    return this.svc.findByFiscalYear(fiscalYearId);
  }

  // Obtiene snapshot por (departmentId, fiscalYearId)
  // GET /income-type-by-department/1/1
  @Get(':departmentId/:fiscalYearId')
  one(
    @Param('departmentId', ParseIntPipe) deptId: number,
    @Param('fiscalYearId', ParseIntPipe) fyId: number,
  ) {
    return this.svc.findOne(deptId, fyId);
  }
}
