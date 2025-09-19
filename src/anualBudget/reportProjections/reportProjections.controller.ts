import { Controller, Get, Query } from '@nestjs/common';
import { ReportProjectionsService } from './reportProjections.service';

@Controller('report-proj')
export class ReportProjectionsController {
  constructor(private readonly svc: ReportProjectionsService) {}

  // ---- INCOME ----
  // GET /report-proj/income?start=2025-09-01&end=2025-09-30&fiscalYearId=1&departmentId=2
  @Get('income')
  compareIncome(
    @Query('start') start?: string,
    @Query('end') end?: string,
    @Query('fiscalYearId') fiscalYearId?: string,
    @Query('month') month?: string,
    @Query('departmentId') departmentId?: string,
    @Query('incomeTypeId') incomeTypeId?: string,
    @Query('incomeSubTypeId') incomeSubTypeId?: string,
  ) {
    return this.svc.compareIncome({
      start,
      end,
      departmentId: departmentId ? Number(departmentId) : undefined,
      incomeTypeId: incomeTypeId ? Number(incomeTypeId) : undefined,
      incomeSubTypeId: incomeSubTypeId ? Number(incomeSubTypeId) : undefined,
    });
  }

  // ---- SPEND ----
  // GET /report-proj/spend?start=2025-09-01&end=2025-09-30&fiscalYearId=1
  @Get('spend')
  compareSpend(
    @Query('start') start?: string,
    @Query('end') end?: string,
    @Query('fiscalYearId') fiscalYearId?: string,
    @Query('month') month?: string,
    @Query('departmentId') departmentId?: string,
    @Query('spendTypeId') spendTypeId?: string,
    @Query('spendSubTypeId') spendSubTypeId?: string,
  ) {
    return this.svc.compareSpend({
      start,
      end,
      departmentId: departmentId ? Number(departmentId) : undefined,
      spendTypeId: spendTypeId ? Number(spendTypeId) : undefined,
      spendSubTypeId: spendSubTypeId ? Number(spendSubTypeId) : undefined,
    });
  }
}
