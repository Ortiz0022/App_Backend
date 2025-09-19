import { Controller, Get, Query } from '@nestjs/common';
import { ReportService } from './report.service';

@Controller('report')
export class ReportController {
  constructor(private readonly svc: ReportService) {}

  // ===== INCOME (lo tuyo) =====
  @Get('income/table')
  getIncomeTable(
    @Query('start') start?: string,
    @Query('end') end?: string,
    @Query('departmentId') departmentId?: string,
    @Query('incomeTypeId') incomeTypeId?: string,
    @Query('incomeSubTypeId') incomeSubTypeId?: string,
  ) {
    return this.svc.getIncomeTable({
      start,
      end,
      departmentId: departmentId ? Number(departmentId) : undefined,
      incomeTypeId: incomeTypeId ? Number(incomeTypeId) : undefined,
      incomeSubTypeId: incomeSubTypeId ? Number(incomeSubTypeId) : undefined,
    });
  }

  @Get('income/summary')
  getIncomeSummary(
    @Query('start') start?: string,
    @Query('end') end?: string,
    @Query('departmentId') departmentId?: string,
    @Query('incomeTypeId') incomeTypeId?: string,
    @Query('incomeSubTypeId') incomeSubTypeId?: string,
  ) {
    return this.svc.getIncomeSummary({
      start,
      end,
      departmentId: departmentId ? Number(departmentId) : undefined,
      incomeTypeId: incomeTypeId ? Number(incomeTypeId) : undefined,
      incomeSubTypeId: incomeSubTypeId ? Number(incomeSubTypeId) : undefined,
    });
  }

  @Get('income/full')
  async getIncomeFull(
    @Query('start') start?: string,
    @Query('end') end?: string,
    @Query('departmentId') departmentId?: string,
    @Query('incomeTypeId') incomeTypeId?: string,
    @Query('incomeSubTypeId') incomeSubTypeId?: string,
  ) {
    const filters = {
      start,
      end,
      departmentId: departmentId ? Number(departmentId) : undefined,
      incomeTypeId: incomeTypeId ? Number(incomeTypeId) : undefined,
      incomeSubTypeId: incomeSubTypeId ? Number(incomeSubTypeId) : undefined,
    };
    const [rows, totals] = await Promise.all([
      this.svc.getIncomeTable(filters),
      this.svc.getIncomeSummary(filters),
    ]);
    return { filters, rows, totals };
  }

  // ===== SPEND (nuevo) =====
  @Get('spend/table')
  getSpendTable(
    @Query('start') start?: string,
    @Query('end') end?: string,
    @Query('departmentId') departmentId?: string,
    @Query('spendTypeId') spendTypeId?: string,
    @Query('spendSubTypeId') spendSubTypeId?: string,
  ) {
    return this.svc.getSpendTable({
      start,
      end,
      departmentId: departmentId ? Number(departmentId) : undefined,
      spendTypeId: spendTypeId ? Number(spendTypeId) : undefined,
      spendSubTypeId: spendSubTypeId ? Number(spendSubTypeId) : undefined,
    });
  }

  @Get('spend/summary')
  getSpendSummary(
    @Query('start') start?: string,
    @Query('end') end?: string,
    @Query('departmentId') departmentId?: string,
    @Query('spendTypeId') spendTypeId?: string,
    @Query('spendSubTypeId') spendSubTypeId?: string,
  ) {
    return this.svc.getSpendSummary({
      start,
      end,
      departmentId: departmentId ? Number(departmentId) : undefined,
      spendTypeId: spendTypeId ? Number(spendTypeId) : undefined,
      spendSubTypeId: spendSubTypeId ? Number(spendSubTypeId) : undefined,
    });
  }

  @Get('spend/full')
  async getSpendFull(
    @Query('start') start?: string,
    @Query('end') end?: string,
    @Query('departmentId') departmentId?: string,
    @Query('spendTypeId') spendTypeId?: string,
    @Query('spendSubTypeId') spendSubTypeId?: string,
  ) {
    const filters = {
      start,
      end,
      departmentId: departmentId ? Number(departmentId) : undefined,
      spendTypeId: spendTypeId ? Number(spendTypeId) : undefined,
      spendSubTypeId: spendSubTypeId ? Number(spendSubTypeId) : undefined,
    };
    const [rows, totals] = await Promise.all([
      this.svc.getSpendTable(filters),
      this.svc.getSpendSummary(filters),
    ]);
    return { filters, rows, totals };
  }
}
