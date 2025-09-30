import { Controller, Get, Query, Res, Header } from '@nestjs/common';
import type { Response } from 'express';
import { ExtraordinaryService } from '../extraordinary/extraordinary.service';
import { ReportExtraService } from './reportExtra.service';
import { ExtraFilters } from './entities/report-extra-filter.entity';

@Controller('report-extra')
export class ReportExtraController {
  constructor(
    private readonly extraSvc: ExtraordinaryService,
    private readonly reportService: ReportExtraService
  ) {}

  // Endpoint original que ya tienes
  @Get('full')
  async full(
    @Query('start') start?: string,   // YYYY-MM-DD
    @Query('end') end?: string,       // YYYY-MM-DD
    @Query('name') name?: string,     // texto a buscar en nombre/descr
  ) {
    const rows = await this.extraSvc.findAll();
    const fName = (name ?? '').trim().toLowerCase();

    const filtered = rows.filter((e: any) => {
      const iso = (e.date ?? e.createdAt)?.toString().slice(0, 10) ?? '';
      if (start && iso < start) return false;
      if (end && iso > end) return false;
      if (fName && !String(e.name ?? e.description ?? '')
          .toLowerCase()
          .includes(fName)) return false;
      return true;
    });

    const toNum = (v: any) => Number(v ?? 0);
    const totalAmount = filtered.reduce((s: number, r: any) => s + toNum(r.amount), 0);
    const totalUsed   = filtered.reduce((s: number, r: any) => s + toNum(r.used), 0);
    const totalRemaining = Math.max(0, +(totalAmount - totalUsed).toFixed(2));

    return {
      filters: { start: start ?? null, end: end ?? null, name: name ?? null },
      rows: filtered.map((e: any) => ({
        id: e.id,
        name: e.name ?? null,
        description: e.description ?? null,
        date: (e.date ?? e.createdAt)?.toString().slice(0,10) ?? null,
        amount: toNum(e.amount),
        used: toNum(e.used),
        remaining: Math.max(0, +(toNum(e.amount) - toNum(e.used)).toFixed(2)),
      })),
      totals: {
        count: filtered.length,
        totalAmount: +totalAmount.toFixed(2),
        totalUsed: +totalUsed.toFixed(2),
        totalRemaining,
      },
    };
  }

  // NUEVO: Endpoint para descargar PDF
  @Get('download/pdf')
  @Header('Content-Type', 'application/pdf')
  async downloadPDF(
    @Query('start') start?: string,
    @Query('end') end?: string,
    @Query('name') name?: string,
    @Res() res?: Response,
  ) {
    const filters: ExtraFilters = { start, end, name };
    
    // Obtener datos del reporte usando los métodos del servicio
    const table = await this.reportService.getExtraTable(filters);
    const summary = await this.reportService.getExtraSummary(filters);
    
    // Generar PDF
    const pdfBuffer = await this.reportService.generatePDF({
      table,
      summary,
      filters
    });

    // Configurar headers para descarga forzada
    const filename = `reporte-extraordinarios-${new Date().toISOString().slice(0, 10)}.pdf`;
    res?.set({
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': pdfBuffer.length,
    });

    res?.end(pdfBuffer);
  }

  // NUEVO: Endpoint para vista previa del PDF en el navegador
  @Get('preview/pdf')
  @Header('Content-Type', 'application/pdf')
  async previewPDF(
    @Query('start') start?: string,
    @Query('end') end?: string,
    @Query('name') name?: string,
    @Res() res?: Response,
  ) {
    const filters: ExtraFilters = { start, end, name };
    
    const table = await this.reportService.getExtraTable(filters);
    const summary = await this.reportService.getExtraSummary(filters);
    
    const pdfBuffer = await this.reportService.generatePDF({
      table,
      summary,
      filters,
    });

    // Para vista previa, no forzamos la descarga
    res?.set({
      'Content-Length': pdfBuffer.length,
    });

    res?.end(pdfBuffer);
  }
}