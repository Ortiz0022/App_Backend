import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Extraordinary } from 'src/anualBudget/extraordinary/entities/extraordinary.entity';
import { Repository } from 'typeorm';
import { ExtraRow } from './entities/report-extra-row.entity';
import { ExtraFilters } from './entities/report-extra-filter.entity';

@Injectable()
export class ReportExtraService {
  constructor(
    @InjectRepository(Extraordinary)
    private readonly repo: Repository<Extraordinary>,
  ) {}

  // Helpers
  private toISODate(e: Extraordinary): string {
    // preferimos el campo date si existe; si no, usamos createdAt (si tu entidad lo tiene)
    const d: string | Date | undefined =
      (e as any).date ?? (e as any).createdAt ?? undefined;
    if (!d) return '';
    const iso = typeof d === 'string' ? d : d.toISOString();
    // recortar a YYYY-MM-DD si viene con tiempo
    return iso.length >= 10 ? iso.slice(0, 10) : iso;
  }

  private mapRow(e: Extraordinary): ExtraRow {
    const amount = Number((e as any).amount ?? 0);
    const used = Number((e as any).used ?? 0);
    const remaining = Math.max(0, +(amount - used).toFixed(2));
    const usedPct = amount > 0 ? +(((used / amount) * 100)).toFixed(2) : 0;
    const remainingPct = amount > 0 ? +(((remaining / amount) * 100)).toFixed(2) : 0;
    return {
      id: (e as any).id,
      name: (e as any).name ?? null,
      date: this.toISODate(e) || null,
      amount,
      used,
      remaining,
      usedPct,
      remainingPct,
    };
  }

  private applyFilters(rows: Extraordinary[], f: ExtraFilters) {
    let out = rows;
    if (f.start || f.end) {
      const startD = f.start ? new Date(f.start) : undefined;
      const endD = f.end ? new Date(f.end) : undefined;
      if ((startD && isNaN(+startD)) || (endD && isNaN(+endD))) {
        throw new BadRequestException('Invalid date range');
      }
      out = out.filter(e => {
        const iso = this.toISODate(e);
        if (!iso) return false;
        const d = new Date(iso);
        if (startD && d < startD) return false;
        if (endD && d > endD) return false;
        return true;
      });
    }
    if (f.name) {
      const needle = f.name.trim().toLowerCase();
      out = out.filter(e => String((e as any).name ?? '').toLowerCase().includes(needle));
    }
    return out;
  }

  // ================== REPORTES ==================

  /** Tabla detallada */
  async getExtraTable(filters: ExtraFilters) {
    const rows = await this.repo.find();
    const filtered = this.applyFilters(rows, filters);
    return filtered
      .map(e => this.mapRow(e))
      .sort((a, b) => {
        const ad = a.date ?? '';
        const bd = b.date ?? '';
        return ad.localeCompare(bd) || (a.name ?? '').localeCompare(b.name ?? '');
      });
  }

  /** Resumen global (totales y porcentajes) */
  async getExtraSummary(filters: ExtraFilters) {
    const rows = await this.repo.find();
    const filtered = this.applyFilters(rows, filters);

    const totalAmount = filtered.reduce((s, r) => s + Number((r as any).amount ?? 0), 0);
    const totalUsed   = filtered.reduce((s, r) => s + Number((r as any).used ?? 0), 0);
    const totalRem    = Math.max(0, +(totalAmount - totalUsed).toFixed(2));
    const usedPct     = totalAmount > 0 ? +((totalUsed / totalAmount) * 100).toFixed(2) : 0;
    const remainingPct= totalAmount > 0 ? +((totalRem / totalAmount) * 100).toFixed(2) : 0;

    return {
      count: filtered.length, 
      totalAmount: +totalAmount.toFixed(2),
      totalUsed: +totalUsed.toFixed(2),
      totalRemaining: totalRem,
      usedPct,
      remainingPct,
    };
  }

  /** Agrupado por mes (YYYY-MM), opcionalmente filtrando por año */
  async getExtraByMonth(year?: number) {
    const rows = await this.repo.find();
    const bucket = new Map<string, { amount: number; used: number }>();

    for (const e of rows) {
      const iso = this.toISODate(e);
      if (!iso) continue;
      const y = +iso.slice(0, 4);
      if (year && y !== year) continue;
      const ym = iso.slice(0, 4) + '-' + iso.slice(5, 7);
      const cur = bucket.get(ym) ?? { amount: 0, used: 0 };
      cur.amount += Number((e as any).amount ?? 0);
      cur.used   += Number((e as any).used ?? 0);
      bucket.set(ym, cur);
    }

    return Array.from(bucket.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, v]) => {
        const remaining = Math.max(0, +(v.amount - v.used).toFixed(2));
        return {
          month, // YYYY-MM
          amount: +v.amount.toFixed(2),
          used: +v.used.toFixed(2),
          remaining,
          usedPct: v.amount > 0 ? +((v.used / v.amount) * 100).toFixed(2) : 0,
          remainingPct: v.amount > 0 ? +((remaining / v.amount) * 100).toFixed(2) : 0,
        };
      });
  }

  /** Resumen por rango (inclusive) usando date o createdAt si no hay date */
  async getExtraRange(start: string, end: string) {
    const startD = new Date(start);
    const endD   = new Date(end);
    if (isNaN(+startD) || isNaN(+endD)) {
      throw new BadRequestException('Invalid date range');
    }
    const rows = await this.repo.find();
    const inRange = rows.filter(e => {
      const iso = this.toISODate(e);
      if (!iso) return false;
      const d = new Date(iso);
      return d >= startD && d <= endD;
    });

    const totalAmount = inRange.reduce((s, r) => s + Number((r as any).amount ?? 0), 0);
    const totalUsed   = inRange.reduce((s, r) => s + Number((r as any).used ?? 0), 0);
    const totalRem    = Math.max(0, +(totalAmount - totalUsed).toFixed(2));
    return {
      start, end,
      count: inRange.length,
      totalAmount: +totalAmount.toFixed(2),
      totalUsed: +totalUsed.toFixed(2),
      totalRemaining: totalRem,
      usedPct: totalAmount > 0 ? +((totalUsed / totalAmount) * 100).toFixed(2) : 0,
      remainingPct: totalAmount > 0 ? +((totalRem / totalAmount) * 100).toFixed(2) : 0,
    };
  }

  /** Top N con mayor saldo pendiente (default 5) */
  async getTopUnspent(limit = 5) {
    const rows = await this.repo.find();
    return rows
      .map(e => this.mapRow(e))
      .sort((a, b) => b.remaining - a.remaining)
      .slice(0, limit);
  }

  // extraordinary.service.ts
async findForReport(opts: { start?: string; end?: string; name?: string }) {
  const qb = this.repo.createQueryBuilder('e');

  if (opts.start && opts.end)
    qb.andWhere(`COALESCE(e.date, e.createdAt) BETWEEN :from AND :to`, { from: opts.start, to: opts.end });
  else if (opts.start)
    qb.andWhere(`COALESCE(e.date, e.createdAt) >= :from`, { from: opts.start });
  else if (opts.end)
    qb.andWhere(`COALESCE(e.date, e.createdAt) <= :to`, { to: opts.end });

  if (opts.name)
    qb.andWhere(`LOWER(COALESCE(e.name, e.description, '')) LIKE :q`, { q: `%${opts.name.toLowerCase().trim()}%` });

  return qb
    .select([
      'e.id AS id',
      'e.name AS name',
      'e.description AS description',
      'e.amount AS amount',
      'e.used AS used',
      `CONVERT(varchar(10), COALESCE(e.date, e.createdAt), 23) AS date`,
    ])
    .orderBy('date','ASC')
    .addOrderBy('e.name','ASC')
    .getRawMany<{
      id:number; name:string|null; description:string|null; amount:string; used:string; date:string|null;
    }>();
}

}