import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { PIncomeTypeByDepartmentService } from './p-income-type-by-department.service';

@Controller('p-income-type-by-department')
export class PIncomeTypeByDepartmentController {
  constructor(private readonly svc: PIncomeTypeByDepartmentService) {}

  // ✅ Recalcula y persiste los totales por departamento para el FY dado
  // GET /income-type-by-department/sync?fiscalYearId=1
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
