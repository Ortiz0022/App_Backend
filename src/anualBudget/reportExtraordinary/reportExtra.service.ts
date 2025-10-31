import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Extraordinary } from 'src/anualBudget/extraordinary/entities/extraordinary.entity';
import { Repository } from 'typeorm';
import { ExtraRow } from './entities/report-extra-row.entity';
import { ExtraFilters } from './entities/report-extra-filter.entity';
import PDFDocument from 'pdfkit';
import * as ExcelJS from 'exceljs';
import { LogoHelper } from '../reportUtils/logo-helper';

type PDFDoc = InstanceType<typeof PDFDocument>; 
@Injectable()
export class ReportExtraService {
  constructor(
    @InjectRepository(Extraordinary)
    private readonly repo: Repository<Extraordinary>,
  ) {}

  // ============= ESTILO ADAPTADO (igual a ingresos/gastos) =============
  private readonly UI = {
    ink: '#33361D',
    gray: '#666',
    line: '#EAEFE0',
    card: {
      total:  { bg:'#F8F9F3', ring:'#EAEFE0', text:'#5B732E', bar:'#5B732E', barSoft:'#CFE0B5' },
      used:   { bg:'#EAEFE0', ring:'#D8E2CC', text:'#556B2F', bar:'#6B8E23', barSoft:'#D6E2B5' },
      remain: { bg:'#FEF6E0', ring:'#F4E7B7', text:'#C19A3D', bar:'#E5C46A', barSoft:'#F2E7C8' },
    }
  };

  // ================== HELPERS ==================
  private toISODate(e: Extraordinary): string {
    const d: string | Date | undefined = (e as any).date ?? (e as any).createdAt ?? undefined;
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

  // ================== MÉTODOS DE REPORTES ==================
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

  // ================== PDF (ESTILO ADAPTADO) ==================
  async generatePDF(data: {
    table: ExtraRow[];
    summary: any;
    filters: ExtraFilters;
  }): Promise<Buffer> {
    await LogoHelper.preloadLogo();
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

        // Generar contenido del PDF usando UI adaptada
        this.addHeader(doc);
       
        if (this.hasFilters(data.filters)) {
          this.addFilters(doc, data.filters);
        }
        
        this.addSummary(doc, data.summary);
        this.addTable(doc, data.table);
        this.addFooter(doc);

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

private addWatermark(doc: PDFDoc) {
  try {
    const logoBuffer = LogoHelper.getLogoSync();
    if (!logoBuffer || logoBuffer.length === 0) return;

    // 1) Abrir imagen con PDFKit (si falla, no se dibuja nada)
    const img: any = (doc as any).openImage?.(logoBuffer);
    if (!img || !img.width || !img.height) return; // <- si llega aquí, formato no soportado (PDFKit: PNG/JPEG)

    const pageW = doc.page.width;
    const pageH = doc.page.height;

    // 2) Escala máxima (ajusta si quieres más grande/pequeño)
    const maxW = pageW * 0.55;
    const maxH = pageH * 0.55;

    const scale = Math.min(maxW / img.width, maxH / img.height);
    const drawW = img.width * scale;
    const drawH = img.height * scale;

    // 3) Coordenadas exactamente centradas
    const x = (pageW - drawW) / 2;
    const y = (pageH - drawH) / 2 + 90;

    doc.save();
    doc.opacity(0.06);            // ⇦ súbelo temporalmente si “no se ve” (luego vuelves a 0.06)
    doc.image(img, x, y, { width: drawW });
    doc.restore();
  } catch {
    // ignorar
  }
}

  // ================== MÉTODOS PRIVADOS PARA PDF (solo estilo visual) ==================
private addHeader(doc: PDFDoc) {
  doc.registerFont('NotoSans', __dirname + '/../../../src/fonts/Noto_Sans/NotoSans-Regular.ttf');
  doc.registerFont('NotoSansBold', __dirname + '/../../../src/fonts/Noto_Sans/NotoSans-Bold.ttf');

   // ✅ Agregar marca de agua en cada página
  this.addWatermark(doc);

  // ✅ TÍTULO (SIN logo, empieza en x=50)
  doc.font('NotoSansBold');
  doc.fontSize(16);
  doc.fillColor(this.UI.ink);
  doc.text('Reportes - Extraordinarios', 50, 40, { align: 'left' });

  // ✅ FECHA
  doc.font('NotoSans');
  doc.fontSize(9);
  doc.fillColor(this.UI.gray);
  doc.text(
    `Generado: ${new Date().toLocaleDateString('es-CR', { day:'2-digit', month:'2-digit', year:'numeric' })} ${new Date().toLocaleTimeString('es-CR')}`,
    50, 58, { align: 'right', width: doc.page.width - 100 }
  );

  // ✅ LÍNEA
  doc.moveTo(50, 70);
  doc.lineTo(doc.page.width - 50, 70);
  doc.strokeColor(this.UI.line);
  doc.lineWidth(1);
  doc.stroke();

  doc.y = 86;
}

  private addFilters(doc: PDFDoc, filters: ExtraFilters) {
    const y = doc.y, W = doc.page.width - 100, H = 84;
    doc.roundedRect(50, y, W, H, 12)
       .lineWidth(1).strokeColor(this.UI.line).stroke();

    doc.font('NotoSansBold').fontSize(11).fillColor(this.UI.ink)
       .text('Filtros', 65, y + 12);

    doc.font('NotoSans').fontSize(9).fillColor(this.UI.gray);
    const start = filters.start ? new Date(filters.start).toLocaleDateString('es-CR', { day:'2-digit', month:'2-digit', year:'numeric' }) : '—';
    const end   = filters.end   ? new Date(filters.end).toLocaleDateString('es-CR', { day:'2-digit', month:'2-digit', year:'numeric' })   : '—';
    const name  = filters.name  ? filters.name : '—';

    doc.text(`Nombre: ${name}`, 65, y + 32, { width: W / 2 - 30 });
    doc.text(`Desde: ${start}`, 65 + W / 2, y + 32, { width: W / 4 - 30 });
    doc.text(`Hasta: ${end}`,  65 + (W * 3) / 4, y + 32, { width: W / 4 - 30 });

    doc.y = y + H + 16;
  }

  private addSummary(doc: PDFDoc, summary: any) {
    const GAP = 10;
    const W = (doc.page.width - 100 - GAP*2) / 3;
    const H = 72;
    const top = doc.y;

    const drawCard = (x: number, label: string, value: number, palette: any, pct?: number) => {
      const prevY = doc.y; // no alterar flujo
      doc.roundedRect(x, top, W, H, 16)
         .lineWidth(1).strokeColor(palette.ring).fillAndStroke(palette.bg);

      doc.font('NotoSansBold').fontSize(9).fillColor(palette.text)
         .text(label.toUpperCase(), x + 14, top + 10);

      doc.font('NotoSansBold').fontSize(18).fillColor(palette.text)
         .text(
           value.toLocaleString('es-CR', { style: 'currency', currency: 'CRC', minimumFractionDigits: 2 }),
           x + 14, top + 26, { width: W - 28 }
         );

      // const barW = W - 28, barY = top + H - 16;
      // doc.roundedRect(x + 14, barY, barW, 6, 3).fillColor(palette.barSoft).fill();
      // const p = Math.max(0, Math.min(100, pct ?? 100));
      // doc.roundedRect(x + 14, barY, Math.max(6, (barW * p) / 100), 6, 3).fillColor(palette.bar).fill();

      doc.y = prevY; // restaurar cursor
    };

    const usedPct = summary.totalAmount > 0 ? Math.round((summary.totalUsed / summary.totalAmount) * 100) : 0;
    const remPct  = summary.totalAmount > 0 ? Math.round((summary.totalRemaining / summary.totalAmount) * 100) : 0;

    drawCard(50,               'Total',     summary.totalAmount,    this.UI.card.total,  100);
    drawCard(50 + W + GAP,     'Usado',     summary.totalUsed,      this.UI.card.used,   usedPct);
    drawCard(50 + 2*(W + GAP), 'Restante',  summary.totalRemaining, this.UI.card.remain, remPct);

    doc.y = top + H + 16;
  }


  private hasFilters(filters: ExtraFilters): boolean {
    // Considera solo filtros relevantes para el PDF
    if (!filters) return false;
    if (filters.start) return true;
    if (filters.end) return true;
    if (filters.name && filters.name.trim() !== '') return true;
    return false;
  }

  
  private addTable(doc: PDFDoc, table: ExtraRow[]) {
    doc.font('NotoSansBold').fontSize(12).fillColor(this.UI.ink).text('Detalle', 50, doc.y);
    doc.moveDown(0.5);

    const left = 50, right = doc.page.width - 50;
    const cols = [
      { key: 'name',    title: 'CONCEPTO',  w: Math.floor((right-left)*0.40), align: 'left' as const },
      { key: 'date',    title: 'FECHA',     w: Math.floor((right-left)*0.15), align: 'left' as const },
      { key: 'amount',  title: 'MONTO',     w: Math.floor((right-left)*0.15), align: 'right' as const },
      { key: 'used',    title: 'USADO',     w: Math.floor((right-left)*0.15), align: 'right' as const },
      { key: 'rem',     title: 'RESTANTE',  w: Math.floor((right-left)*0.15), align: 'right' as const },
    ];
    const x: number[] = [];
    cols.reduce((acc, c, i) => { const xx = i === 0 ? left : acc + cols[i-1].w; x.push(xx); return xx; }, 0);

    let y = doc.y + 6;

    // Header
    doc.roundedRect(left, y, right-left, 28, 12)
       .fillColor('#F9FAFB').strokeColor(this.UI.line).lineWidth(1).fillAndStroke();
    doc.font('NotoSansBold').fontSize(9).fillColor(this.UI.gray);
    cols.forEach((c, i) => doc.text(c.title, x[i] + 10, y + 9, { width: c.w - 20, align: c.align }));
    y += 34;

    const bottom = () => doc.page.height - doc.page.margins.bottom;
    const ensure = (rowH=22) => {
      if (y + rowH > bottom()) {
        doc.addPage(); y = doc.page.margins.top;
        doc.roundedRect(left, y, right-left, 28, 12)
           .fillColor('#F9FAFB').strokeColor(this.UI.line).lineWidth(1).fillAndStroke();
        doc.font('NotoSansBold').fontSize(9).fillColor(this.UI.gray);
        cols.forEach((c, i) => doc.text(c.title, x[i] + 10, y + 9, { width: c.w - 20, align: c.align }));
        y += 34;  
      }
    };

    if (table.length === 0) {
      ensure(40);
      doc.font('NotoSans').fontSize(10).fillColor('#EF4444')
         .text('Sin resultados con los filtros aplicados.', left, y + 6);
      doc.y = y + 40;
      return;
    }

    // Filas (solo presentación)
    table.forEach((row, idx) => {
      ensure(24);

      // zebra
      doc.rect(left, y, right-left, 22)
         .fillColor(idx % 2 === 0 ? '#FFFFFF' : '#FAFAFA')
         .fill();

      const name   = row.name ?? '—';
      const date   = row.date ? new Date(row.date).toLocaleDateString('es-CR', { day:'2-digit', month:'2-digit', year:'numeric' }) : '—';
      const amount = row.amount.toLocaleString('es-CR', { style:'currency', currency:'CRC', minimumFractionDigits: 2 });
      const used   = row.used.toLocaleString('es-CR',   { style:'currency', currency:'CRC', minimumFractionDigits: 2 });
      const rem    = row.remaining.toLocaleString('es-CR', { style:'currency', currency:'CRC', minimumFractionDigits: 2 });

      doc.font('NotoSans').fontSize(9).fillColor(this.UI.ink);
      const vals = { name, date, amount, used, rem };
      cols.forEach((c, i) => {
        doc.text(String((vals as any)[c.key]), x[i] + 10, y + 6, { width: c.w - 20, align: c.align });
      });

      y += 22;
      doc.moveTo(left, y).lineTo(right, y).strokeColor(this.UI.line).lineWidth(0.5).stroke();
    });

    doc.y = y + 8;
  }

  private addFooter(doc: PDFDoc) {
    const y = doc.page.height - 32;
    doc.moveTo(50, y - 8).lineTo(doc.page.width - 50, y - 8)
       .strokeColor(this.UI.line).lineWidth(1).stroke();

    doc.font('NotoSans').fontSize(8).fillColor(this.UI.gray)
       .text('Sistema de Presupuesto — Reporte de Extraordinario',
             50, y, { width: doc.page.width - 100, align: 'center' });
  }

  
   // ================== EXCEL ==================
  async generateExcel(data: {
    table: ExtraRow[];
    summary: any;
    filters: ExtraFilters;
  }): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Extraordinarios');

    const moneyFmt = '"₡"#,##0.00;[Red]-"₡"#,##0.00';
    const headerFill: ExcelJS.Fill = { type: 'pattern', pattern:'solid', fgColor:{ argb: 'FFF8F9F3' } };
    const headerFont: Partial<ExcelJS.Font> = { name: 'Arial', size: 11, bold: true, color: { argb: 'FF5B732E' } };
    const borderAll: ExcelJS.Border = { style: 'thin', color: { argb: 'FFEAEFE0' } };

    // Columnas
    sheet.columns = [
      { header: 'CONCEPTO',  key: 'name',      width: 35 },
      { header: 'FECHA',     key: 'date',      width: 14 },
      { header: 'MONTO',     key: 'amount',    width: 16, style: { numFmt: moneyFmt } },
      { header: 'USADO',     key: 'used',      width: 16, style: { numFmt: moneyFmt } },
      { header: 'RESTANTE',  key: 'remaining', width: 16, style: { numFmt: moneyFmt } },
    ];

    // Estilo del header
    sheet.getRow(1).eachCell((cell) => {
      cell.fill = headerFill;
      cell.font = headerFont;
      cell.border = { top: borderAll, left: borderAll, bottom: borderAll, right: borderAll };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    // Datos
    data.table.forEach(row => {
      sheet.addRow({
        name: row.name ?? '—',
        date: row.date ?? '',
        amount: row.amount,
        used: row.used,
        remaining: row.remaining,
      });
    });

    // Fila de totales
    const totalRow = sheet.addRow({
      name: 'TOTALES',
      date: '',
      amount: data.summary.totalAmount ?? 0,
      used: data.summary.totalUsed ?? 0,
      remaining: data.summary.totalRemaining ?? 0,
    });

    // Estilo para totales
    totalRow.eachCell((cell, colNumber) => {
      cell.font = { name: 'Arial', bold: true };
      cell.border = { 
        top: { style: 'thin', color: { argb: 'FFCBD5E1' } }, 
        left: borderAll, 
        right: borderAll, 
        bottom: borderAll 
      };
      if (colNumber > 2) cell.numFmt = moneyFmt;
    });

    // Bordes y alineación para todas las celdas
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header
      row.eachCell((cell, colNumber) => {
        cell.border = { top: borderAll, left: borderAll, bottom: borderAll, right: borderAll };
        if (!cell.font?.bold) cell.font = { name: 'Arial', size: 10 };
        cell.alignment = { 
          vertical: 'middle', 
          horizontal: colNumber === 1 ? 'left' : (colNumber === 2 ? 'center' : 'right')
        };
      });
    });

    const out = await workbook.xlsx.writeBuffer();
    return Buffer.isBuffer(out) ? out as Buffer : Buffer.from(out as ArrayBuffer);
  }
}
