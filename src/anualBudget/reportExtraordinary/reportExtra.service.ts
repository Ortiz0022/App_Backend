import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Extraordinary } from 'src/anualBudget/extraordinary/entities/extraordinary.entity';
import { Repository } from 'typeorm';
import { ExtraRow } from './entities/report-extra-row.entity';
import { ExtraFilters } from './entities/report-extra-filter.entity';
import PDFDocument from 'pdfkit';

@Injectable()
export class ReportExtraService {
  constructor(
    @InjectRepository(Extraordinary)
    private readonly repo: Repository<Extraordinary>,
  ) {}

  // ================== HELPERS (ya existían) ==================
  private toISODate(e: Extraordinary): string {
    const d: string | Date | undefined =
      (e as any).date ?? (e as any).createdAt ?? undefined;
    if (!d) return '';
    const iso = typeof d === 'string' ? d : d.toISOString();
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

  // ================== MÉTODOS DE REPORTES (ya existían) ==================
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
          month,
          amount: +v.amount.toFixed(2),
          used: +v.used.toFixed(2),
          remaining,
          usedPct: v.amount > 0 ? +((v.used / v.amount) * 100).toFixed(2) : 0,
          remainingPct: v.amount > 0 ? +((remaining / v.amount) * 100).toFixed(2) : 0,
        };
      });
  }

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

  async getTopUnspent(limit = 5) {
    const rows = await this.repo.find();
    return rows
      .map(e => this.mapRow(e))
      .sort((a, b) => b.remaining - a.remaining)
      .slice(0, limit);
  }

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

  // ================== GENERACIÓN DE PDF (sin cambios de lógica) ==================
  async generatePDF(data: {
    table: ExtraRow[];
    summary: any;
    filters: ExtraFilters;
  }): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ 
          margin: 40,
          size: 'A4',
          layout: 'portrait'
        });
        const chunks: Buffer[] = [];

        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Generar contenido del PDF (mismas llamadas)
        this.addHeader(doc);
        this.addFilters(doc, data.filters);
        this.addSummary(doc, data.summary);
        this.addTable(doc, data.table);
        this.addFooter(doc);

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  // ================== MÉTODOS PRIVADOS PARA PDF (solo ESTILO) ==================
  private readonly UI = {
    ink: '#111827',
    gray: '#6B7280',
    line: '#E5E7EB',
    card: {
      total:   { bg: '#EEF2FF', ring: '#E0E7FF', text: '#3730A3', bar: '#4F46E5', barSoft: '#C7D2FE' },
      used:    { bg: '#ECFDF5', ring: '#D1FAE5', text: '#065F46', bar: '#10B981', barSoft: '#A7F3D0' },
      remain:  { bg: '#FFFBEB', ring: '#FEF3C7', text: '#92400E', bar: '#F59E0B', barSoft: '#FDE68A' },
    }
  };

  private addHeader(doc: PDFKit.PDFDocument) {
    // Encabezado sobrio
    doc.font('Helvetica-Bold').fontSize(16).fillColor(this.UI.ink)
       .text('Reportes — Extraordinario', 50, 40, { align: 'left' });

    doc.font('Helvetica').fontSize(9).fillColor(this.UI.gray)
       .text(`Generado: ${new Date().toLocaleDateString('es-CR', {day:'2-digit',month:'2-digit',year:'numeric'})} ${new Date().toLocaleTimeString('es-CR')}`,
         50, 58, { align: 'right', width: doc.page.width - 100 });

    doc.moveTo(50, 70).lineTo(doc.page.width - 50, 70)
       .strokeColor(this.UI.line).lineWidth(1).stroke();

    doc.y = 86;
  }

  private addFilters(doc: PDFKit.PDFDocument, filters: ExtraFilters) {
    // Card de filtros
    const y = doc.y, W = doc.page.width - 100, H = 84;
    doc.roundedRect(50, y, W, H, 12).lineWidth(1).strokeColor(this.UI.line).stroke();

    doc.font('Helvetica-Bold').fontSize(11).fillColor(this.UI.ink)
       .text('Filtros', 65, y + 12);

    doc.font('Helvetica').fontSize(9).fillColor(this.UI.gray);
    const start = filters.start ? new Date(filters.start).toLocaleDateString('es-CR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';
    const end   = filters.end   ? new Date(filters.end).toLocaleDateString('es-CR', { day: '2-digit', month: '2-digit', year: 'numeric' })   : '—';
    const name  = filters.name  ? filters.name : '—';

    doc.text(`Nombre: ${name}`, 65, y + 32, { width: W / 2 - 30 });
    doc.text(`Desde: ${start}`, 65 + W / 2, y + 32, { width: W / 4 - 30 });
    doc.text(`Hasta: ${end}`,  65 + (W * 3) / 4, y + 32, { width: W / 4 - 30 });

    doc.y = y + H + 16;
  }

  private addSummary(doc: PDFKit.PDFDocument, summary: any) {
    // Tres "cards" como en la UI (Total / Usado / Restante)
    const GAP = 10;
    const W = (doc.page.width - 100 - GAP*2) / 3;
    const H = 72;
    const top = doc.y;

    const drawCard = (x: number, label: string, value: number, palette: any, pct?: number) => {
      doc.roundedRect(x, top, W, H, 16)
         .lineWidth(1).strokeColor(palette.ring).fillAndStroke(palette.bg);

      doc.font('Helvetica-Bold').fontSize(9).fillColor(palette.text)
         .text(label.toUpperCase(), x + 14, top + 10);

      doc.font('Helvetica-Bold').fontSize(18).fillColor(palette.text)
         .text(
           value.toLocaleString('es-CR', { style: 'currency', currency: 'CRC', minimumFractionDigits: 2 }),
           x + 14, top + 26, { width: W - 28 }
         );

      const barW = W - 28, barY = top + H - 16;
      doc.roundedRect(x + 14, barY, barW, 6, 3).fillColor(palette.barSoft).fill();
      const p = Math.max(0, Math.min(100, pct ?? 100));
      doc.roundedRect(x + 14, barY, Math.max(6, (barW * p) / 100), 6, 3).fillColor(palette.bar).fill();
    };

    const usedPct = summary.totalAmount > 0 ? Math.round((summary.totalUsed / summary.totalAmount) * 100) : 0;
    const remPct  = summary.totalAmount > 0 ? Math.round((summary.totalRemaining / summary.totalAmount) * 100) : 0;

    drawCard(50,           'Total',   summary.totalAmount,    this.UI.card.total,   100);
    drawCard(50 + W + GAP, 'Usado',   summary.totalUsed,      this.UI.card.used,    usedPct);
    drawCard(50 + 2*(W + GAP), 'Restante', summary.totalRemaining, this.UI.card.remain,  remPct);

    doc.y = top + H + 16;
  }

  private addTable(doc: PDFKit.PDFDocument, table: ExtraRow[]) {
    // Título de sección
    doc.font('Helvetica-Bold').fontSize(12).fillColor(this.UI.ink).text('Detalle', 50, doc.y);
    doc.moveDown(0.5);

    const left = 50, right = doc.page.width - 50;
    const cols = [
      { key: 'name',  title: 'CONCEPTO',  w: Math.floor((right-left)*0.40), align: 'left' as const },
      { key: 'date',  title: 'FECHA',     w: Math.floor((right-left)*0.15), align: 'left' as const },
      { key: 'amount',title: 'MONTO',     w: Math.floor((right-left)*0.15), align: 'right' as const },
      { key: 'used',  title: 'USADO',     w: Math.floor((right-left)*0.15), align: 'right' as const },
      { key: 'rem',   title: 'RESTANTE',  w: Math.floor((right-left)*0.15), align: 'right' as const },
    ];
    const x: number[] = [];
    cols.reduce((acc, c, i) => {
      const xx = i === 0 ? left : acc + cols[i-1].w;
      x.push(xx);
      return xx;
    }, 0);

    let y = doc.y + 6;

    // Header de la tabla
    doc.roundedRect(left, y, right-left, 28, 12)
       .fillColor('#F9FAFB').strokeColor(this.UI.line).lineWidth(1).fillAndStroke();
    doc.font('Helvetica-Bold').fontSize(9).fillColor(this.UI.gray);
    cols.forEach((c, i) => doc.text(c.title, x[i] + 10, y + 9, { width: c.w - 20, align: c.align }));
    y += 34;

    // Filas
    const bottom = () => doc.page.height - doc.page.margins.bottom;
    const ensure = (rowH=22) => { if (y + rowH > bottom()) { doc.addPage(); y = doc.page.margins.top; } };

    if (table.length === 0) {
      ensure(40);
      doc.font('Helvetica').fontSize(10).fillColor('#EF4444')
         .text('Sin resultados con los filtros aplicados.', left, y + 6);
      doc.y = y + 40;
      return;
    }

    table.forEach((row, idx) => {
      ensure(24);

      // Zebra
      doc.rect(left, y, right-left, 22)
         .fillColor(idx % 2 === 0 ? '#FFFFFF' : '#FAFAFA')
         .fill();

      // Textos
      doc.font('Helvetica').fontSize(9).fillColor(this.UI.ink);
      const vals = {
        name: row.name ?? '—',
        date: row.date ? new Date(row.date).toLocaleDateString('es-CR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—',
        amount: row.amount.toLocaleString('es-CR', { style: 'currency', currency: 'CRC', minimumFractionDigits: 2 }),
        used: row.used.toLocaleString('es-CR', { style: 'currency', currency: 'CRC', minimumFractionDigits: 2 }),
        rem: row.remaining.toLocaleString('es-CR', { style: 'currency', currency: 'CRC', minimumFractionDigits: 2 }),
      };
      cols.forEach((c, i) => {
        doc.text(String((vals as any)[c.key]), x[i] + 10, y + 6, { width: c.w - 20, align: c.align });
      });

      y += 22;
      doc.moveTo(left, y).lineTo(right, y).strokeColor(this.UI.line).lineWidth(0.5).stroke();
    });

    doc.y = y + 8;
  }

  private addFooter(doc: PDFKit.PDFDocument) {
    const y = doc.page.height - 32;
    doc.moveTo(50, y - 8).lineTo(doc.page.width - 50, y - 8)
       .strokeColor(this.UI.line).lineWidth(1).stroke();
    doc.font('Helvetica').fontSize(8).fillColor(this.UI.gray)
       .text('Sistema de Presupuesto — Reporte de Extraordinario',
             50, y, { width: doc.page.width - 100, align: 'center' });
  }
}
