import { Controller, Get, Query } from '@nestjs/common';
import { ExtraordinaryService } from '../extraordinary/extraordinary.service';

@Controller('report-extra')
export class ReportExtraController {
  constructor(private readonly extraSvc: ExtraordinaryService) {}

  // endpoint único que tu UI necesita: tabla + totales + filtros
  @Get('full')
  async full(
    @Query('start') start?: string,   // YYYY-MM-DD
    @Query('end') end?: string,       // YYYY-MM-DD
    @Query('name') name?: string,     // texto a buscar en nombre/descr
  ) {
    const rows = await this.extraSvc.findAll(); // 👈 reuso directo
    const fName = (name ?? '').trim().toLowerCase();

    const filtered = rows.filter((e: any) => {
      // usa e.date si existe; si no, createdAt
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
}