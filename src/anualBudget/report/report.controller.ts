// report.controller.ts
import { Controller, Get, Query, Header, Res, BadRequestException } from '@nestjs/common';
import type { Response } from 'express';
import { ReportService } from './report.service';
import { Roles } from 'src/auth/roles.decorator';

@Controller('report')
@Roles('ADMIN', 'JUNTA')
export class ReportController {
  constructor(private readonly svc: ReportService) {}

  // ================= INCOME =================
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

  @Get('income/pdf')
  @Header('Content-Type', 'application/pdf')
  async incomePdf(
    @Query('start') start?: string,
    @Query('end') end?: string,
    @Query('departmentId') departmentId?: string,
    @Query('incomeTypeId') incomeTypeId?: string,
    @Query('incomeSubTypeId') incomeSubTypeId?: string,
    @Query('preview') preview?: string,
    @Res() res?: Response,
  ) {
    const filters = {
      start,
      end,
      departmentId: departmentId ? Number(departmentId) : undefined,
      incomeTypeId: incomeTypeId ? Number(incomeTypeId) : undefined,
      incomeSubTypeId: incomeSubTypeId ? Number(incomeSubTypeId) : undefined,
    };
    const pdfBuffer = await this.svc.generateIncomePDF(filters);
    const filename = `reporte-ingresos-${new Date().toISOString().slice(0, 10)}.pdf`;
    res?.set({
      'Content-Disposition': preview === 'true' ? `inline; filename="${filename}"` : `attachment; filename="${filename}"`,
      'Content-Length': pdfBuffer.length,
    });
    res?.end(pdfBuffer);
  }

  // ✅ NUEVO: Excel de Ingresos
  @Get('income/excel')
  @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  async incomeExcel(
    @Query('start') start?: string,
    @Query('end') end?: string,
    @Query('departmentId') departmentId?: string,
    @Query('incomeTypeId') incomeTypeId?: string,
    @Query('incomeSubTypeId') incomeSubTypeId?: string,
    @Res() res?: Response,
  ) {
    try {
      const filters = {
        start,
        end,
        departmentId: departmentId ? Number(departmentId) : undefined,
        incomeTypeId: incomeTypeId ? Number(incomeTypeId) : undefined,
        incomeSubTypeId: incomeSubTypeId ? Number(incomeSubTypeId) : undefined,
      };
      const excel = await this.svc.generateIncomeExcel(filters);
      const filename = `reporte-ingresos-${new Date().toISOString().slice(0, 10)}.xlsx`;
      res?.set({
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': excel.length,
        'Cache-Control': 'no-store',
      });
      return res?.send(excel);
    } catch {
      throw new BadRequestException('No se pudo generar el Excel de ingresos');
    }
  }

  // ================= SPEND =================
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

  @Get('spend/pdf')
  @Header('Content-Type', 'application/pdf')
  async spendPdf(
    @Query('start') start?: string,
    @Query('end') end?: string,
    @Query('departmentId') departmentId?: string,
    @Query('spendTypeId') spendTypeId?: string,
    @Query('spendSubTypeId') spendSubTypeId?: string,
    @Query('preview') preview?: string,
    @Res() res?: Response,
  ) {
    const filters = {
      start,
      end,
      departmentId: departmentId ? Number(departmentId) : undefined,
      spendTypeId: spendTypeId ? Number(spendTypeId) : undefined,
      spendSubTypeId: spendSubTypeId ? Number(spendSubTypeId) : undefined,
    };
    const pdfBuffer = await this.svc.generateSpendPDF(filters);
    const filename = `reporte-egresos-${new Date().toISOString().slice(0, 10)}.pdf`;
    res?.set({
      'Content-Disposition': preview === 'true' ? `inline; filename="${filename}"` : `attachment; filename="${filename}"`,
      'Content-Length': pdfBuffer.length,
    });
    res?.end(pdfBuffer);
  }

  // ✅ NUEVO: Excel de Egresos
  @Get('spend/excel')
  @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  async spendExcel(
    @Query('start') start?: string,
    @Query('end') end?: string,
    @Query('departmentId') departmentId?: string,
    @Query('spendTypeId') spendTypeId?: string,
    @Query('spendSubTypeId') spendSubTypeId?: string,
    @Res() res?: Response,
  ) {
    try {
      const filters = {
        start,
        end,
        departmentId: departmentId ? Number(departmentId) : undefined,
        spendTypeId: spendTypeId ? Number(spendTypeId) : undefined,
        spendSubTypeId: spendSubTypeId ? Number(spendSubTypeId) : undefined,
      };
      const excel = await this.svc.generateSpendExcel(filters);
      const filename = `reporte-egresos-${new Date().toISOString().slice(0, 10)}.xlsx`;
      res?.set({
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': excel.length,
        'Cache-Control': 'no-store',
      });
      return res?.send(excel);
    } catch {
      throw new BadRequestException('No se pudo generar el Excel de egresos');
    }
  }
}