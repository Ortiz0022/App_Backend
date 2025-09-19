import { Controller, Get, Query } from '@nestjs/common';
import { ReportService } from './report.service';

// Filtros por querystring:
// start, end: 'YYYY-MM-DD'
// departmentId, incomeTypeId, incomeSubTypeId: number
@Controller('report')
export class ReportController {
  constructor(private readonly svc: ReportService) {}

  // Detalle de ingresos (filtrado)
  // GET /report/income/table?start=2025-09-01&end=2025-09-30&departmentId=1
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

  // Totales (por subtipo de ingreso, por departamento y global)
  // GET /report/income/summary?start=2025-09-01&end=2025-09-30
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

  // Paquete completo para tu pantalla: rows + totals
  // GET /report/income/full?start=2025-09-01&end=2025-09-30&departmentId=1
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
}
