import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import PDFDocument from 'pdfkit';
import * as ExcelJS from 'exceljs';
import { Income } from '../income/entities/income.entity';
import { IncomeSubType } from '../incomeSubType/entities/income-sub-type.entity';
import { IncomeType } from '../incomeType/entities/income-type.entity';
import { Spend } from '../spend/entities/spend.entity';
import { SpendSubType } from '../spendSubType/entities/spend-sub-type.entity';
import { SpendType } from '../spendType/entities/spend-type.entity';
import { Department } from '../department/entities/department.entity';
import { IncomeFilters } from './dto/report-income-filters.dto';
import { SpendFilters } from './dto/report-spend-filters.dto';

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(Income) private readonly incomeRepo: Repository<Income>,
    @InjectRepository(IncomeSubType) private readonly subTypeRepo: Repository<IncomeSubType>,
    @InjectRepository(IncomeType) private readonly typeRepo: Repository<IncomeType>,
    @InjectRepository(Department) private readonly deptRepo: Repository<Department>,

    @InjectRepository(Spend) private readonly spendRepo: Repository<Spend>,
    @InjectRepository(SpendSubType) private readonly sSubTypeRepo: Repository<SpendSubType>,
    @InjectRepository(SpendType) private readonly sTypeRepo: Repository<SpendType>,
  ) {}

  // =================== UI (match Extra) ===================
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

  // ====== Fuentes y moneda (₡/CRC seguro) ======
  private hasNotoSans = false;
  private moneyPrefix: '₡'|'CRC' = 'CRC';

  private registerFonts(doc: PDFKit.PDFDocument) {
    try {
      doc.registerFont('NotoSans',     __dirname + '/../../../src/fonts/Noto_Sans/NotoSans-Regular.ttf');
      this.hasNotoSans = true;
    } catch {}
    try {
      doc.registerFont('NotoSansBold', __dirname + '/../../../src/fonts/Noto_Sans/NotoSans-Bold.ttf');
      this.hasNotoSans = true;
    } catch {}

    this.moneyPrefix = this.hasNotoSans ? '₡' : 'CRC';
    this.fontRegular(doc);
  }

  private fontRegular(doc: PDFKit.PDFDocument) {
    try { doc.font('NotoSans'); } catch { try { doc.font('Helvetica'); } catch {} }
  }
  private fontBold(doc: PDFKit.PDFDocument) {
    try { doc.font('NotoSansBold'); } catch { try { doc.font('Helvetica-Bold'); } catch { try { doc.font('Helvetica'); } catch {} } }
  }

  // ================= HELPERS =================
  private formatCRC(n: number) {
    const sign = n < 0 ? '-' : '';
    const abs = Math.abs(Number(n ?? 0));
    const fixed = abs.toFixed(2);
    const [int, dec] = fixed.split('.');
    const miles = int.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${sign}${this.moneyPrefix} ${miles},${dec}`;
  }

  private safeDate(d?: any) {
    if (!d) return '—';
    const dt = new Date(d);
    if (isNaN(+dt)) return String(d);
    return dt.toLocaleDateString('es-CR', { day:'2-digit', month:'2-digit', year:'numeric' });
  }

  private applyDateFiltersIncome(qb: any, f: IncomeFilters) {
    if (f.start && f.end) qb.andWhere('i.date BETWEEN :from AND :to', { from: f.start, to: f.end });
    else if (f.start) qb.andWhere('i.date >= :from', { from: f.start });
    else if (f.end) qb.andWhere('i.date <= :to', { to: f.end });
  }

  private applyDateFiltersSpend(qb: any, f: SpendFilters) {
    if (f.start && f.end) qb.andWhere('s.date BETWEEN :from AND :to', { from: f.start, to: f.end });
    else if (f.start) qb.andWhere('s.date >= :from', { from: f.start });
    else if (f.end) qb.andWhere('s.date <= :to', { to: f.end });
  }

  // ================= INCOME =================
  async getIncomeTable(filters: IncomeFilters) {
    const qb = this.incomeRepo
      .createQueryBuilder('i')
      .leftJoin('i.incomeSubType', 'st')
      .leftJoin('st.incomeType', 't')
      .leftJoin('t.department', 'd');

    this.applyDateFiltersIncome(qb, filters);

    if (filters.departmentId) qb.andWhere('t.departmentId = :dep', { dep: filters.departmentId });
    if (filters.incomeTypeId) qb.andWhere('t.id = :t', { t: filters.incomeTypeId });
    if (filters.incomeSubTypeId) qb.andWhere('st.id = :st', { st: filters.incomeSubTypeId });

    qb.select([
      'i.id AS id',
      'i.date AS date',
      'i.amount AS amount',
      'd.id AS departmentId',
      'd.name AS departmentName',
      't.id AS incomeTypeId',
      't.name AS incomeTypeName',
      'st.id AS incomeSubTypeId',
      'st.name AS incomeSubTypeName',
    ])
    .orderBy('i.date','ASC')
    .addOrderBy('d.name','ASC')
    .addOrderBy('t.name','ASC')
    .addOrderBy('st.name','ASC');

    const raw = await qb.getRawMany<any>();
    return raw.map(r => ({
      id: r.id,
      date: r.date,
      amount: Number(r.amount || 0),
      department: { id: r.departmentId, name: r.departmentName },
      incomeType: { id: r.incomeTypeId, name: r.incomeTypeName },
      incomeSubType: { id: r.incomeSubTypeId, name: r.incomeSubTypeName },
    }));
  }

  async getIncomeSummary(filters: IncomeFilters) {
    const base = this.incomeRepo
      .createQueryBuilder('i')
      .leftJoin(IncomeSubType, 'st', 'st.id = i.incomeSubTypeId')
      .leftJoin(IncomeType, 't', 't.id = st.incomeTypeId')
      .leftJoin(Department, 'd', 'd.id = t.departmentId');

    this.applyDateFiltersIncome(base, filters);

    if (filters.departmentId) base.andWhere('t.departmentId = :dep', { dep: filters.departmentId });
    if (filters.incomeSubTypeId) base.andWhere('i.incomeSubTypeId = :st', { st: filters.incomeSubTypeId });
    if (filters.incomeTypeId) base.andWhere('t.id = :t', { t: filters.incomeTypeId });

    const byIncomeSubType = await base.clone()
      .select(['st.id AS incomeSubTypeId','st.name AS incomeSubTypeName','COALESCE(SUM(i.amount),0) AS total'])
      .groupBy('st.id').addGroupBy('st.name').orderBy('total','DESC')
      .getRawMany<any>();

    const byDepartment = await base.clone()
      .select(['d.id AS departmentId','d.name AS departmentName','COALESCE(SUM(i.amount),0) AS total'])
      .groupBy('d.id').addGroupBy('d.name').orderBy('total','DESC')
      .getRawMany<any>();

    const grand = await base.clone()
      .select('COALESCE(SUM(i.amount),0)','grand')
      .getRawOne<{ grand: string }>();

    return {
      byIncomeSubType: byIncomeSubType.map(x => ({ incomeSubTypeId:x.incomeSubTypeId, incomeSubTypeName:x.incomeSubTypeName, total:Number(x.total||0) })),
      byDepartment: byDepartment.map(x => ({ departmentId:x.departmentId, departmentName:x.departmentName, total:Number(x.total||0) })),
      grandTotal: Number(grand?.grand||0),
    };
  }

  // ================= SPEND =================
  async getSpendTable(filters: SpendFilters) {
    const qb = this.spendRepo
      .createQueryBuilder('s')
      .leftJoin('s.spendSubType', 'sst')
      .leftJoin('sst.spendType', 'st')
      .leftJoin('st.department', 'd');

    this.applyDateFiltersSpend(qb, filters);

    if (filters.departmentId) qb.andWhere('st.departmentId = :dep', { dep: filters.departmentId });
    if (filters.spendTypeId) qb.andWhere('st.id = :t', { t: filters.spendTypeId });
    if (filters.spendSubTypeId) qb.andWhere('sst.id = :sst', { sst: filters.spendSubTypeId });

    qb.select([
      's.id AS id',
      's.date AS date',
      's.amount AS amount',
      'd.id AS departmentId',
      'd.name AS departmentName',
      'st.id AS spendTypeId',
      'st.name AS spendTypeName',
      'sst.id AS spendSubTypeId',
      'sst.name AS spendSubTypeName',
    ])
    .orderBy('s.date','ASC')
    .addOrderBy('d.name','ASC')
    .addOrderBy('st.name','ASC')
    .addOrderBy('sst.name','ASC');

    const raw = await qb.getRawMany<any>();
    return raw.map(r => ({
      id: r.id,
      date: r.date,
      amount: Number(r.amount || 0),
      department: { id: r.departmentId, name: r.departmentName },
      spendType: { id: r.spendTypeId, name: r.spendTypeName },
      spendSubType: { id: r.spendSubTypeId, name: r.spendSubTypeName },
    }));
  }

  async getSpendSummary(filters: SpendFilters) {
    const base = this.spendRepo
      .createQueryBuilder('s')
      .leftJoin(SpendSubType, 'sst', 'sst.id = s.spendSubTypeId')
      .leftJoin(SpendType, 'st', 'st.id = sst.spendTypeId')
      .leftJoin(Department, 'd', 'd.id = st.departmentId');

    this.applyDateFiltersSpend(base, filters);

    if (filters.departmentId) base.andWhere('st.departmentId = :dep', { dep: filters.departmentId });
    if (filters.spendSubTypeId) base.andWhere('s.spendSubTypeId = :sst', { sst: filters.spendSubTypeId });
    if (filters.spendTypeId) base.andWhere('st.id = :t', { t: filters.spendTypeId });

    const bySpendSubType = await base.clone()
      .select(['sst.id AS spendSubTypeId','sst.name AS spendSubTypeName','COALESCE(SUM(s.amount),0) AS total'])
      .groupBy('sst.id').addGroupBy('sst.name').orderBy('total','DESC')
      .getRawMany<any>();

    const byDepartment = await base.clone()
      .select(['d.id AS departmentId','d.name AS departmentName','COALESCE(SUM(s.amount),0) AS total'])
      .groupBy('d.id').addGroupBy('d.name').orderBy('total','DESC')
      .getRawMany<any>();

    const grand = await base.clone()
      .select('COALESCE(SUM(s.amount),0)','grand')
      .getRawOne<{ grand: string }>();

    return {
      bySpendSubType: bySpendSubType.map(x => ({ spendSubTypeId:x.spendSubTypeId, spendSubTypeName:x.spendSubTypeName, total:Number(x.total||0) })),
      byDepartment: byDepartment.map(x => ({ departmentId:x.departmentId, departmentName:x.departmentName, total:Number(x.total||0) })),
      grandTotal: Number(grand?.grand||0),
    };
  }

  // ================= PDF =================
  async generateIncomePDF(filters: IncomeFilters) {
    const table = await this.getIncomeTable(filters);
    const summary = await this.getIncomeSummary(filters);
    return this.generatePDF({
      title: 'Ingresos',
      filters,
      filterKind: 'income',
      table,
      summary,
      columns: [
        { key:'date',          title:'FECHA',        w: 85 },
        { key:'department',    title:'DEPARTAMENTO', w: 120, map:(r:any)=>r.department.name },
        { key:'incomeType',    title:'TIPO',         w: 100, map:(r:any)=>r.incomeType.name },
        { key:'incomeSubType', title:'SUBTIPO',      w: 100, map:(r:any)=>r.incomeSubType.name },
        { key:'amount',        title:'MONTO',        w: 90,  map:(r:any)=>r.amount, align:'right' as const },
      ],
    });
  }

  async generateSpendPDF(filters: SpendFilters) {
    const table = await this.getSpendTable(filters);
    const summary = await this.getSpendSummary(filters);
    return this.generatePDF({
      title: 'Egresos',
      filters,
      filterKind: 'spend',
      table,
      summary,
      columns: [
        { key:'date',         title:'FECHA',        w: 85 },
        { key:'department',   title:'DEPARTAMENTO', w: 120, map:(r:any)=>r.department.name },
        { key:'spendType',    title:'TIPO',         w: 100, map:(r:any)=>r.spendType.name },
        { key:'spendSubType', title:'SUBTIPO',      w: 100, map:(r:any)=>r.spendSubType.name },
        { key:'amount',       title:'MONTO',        w: 90,  map:(r:any)=>r.amount, align:'right' as const },
      ],
    });
  }

  private hasFiltersIncome(f?: IncomeFilters) {
    if (!f) return false;
    if (f.start || f.end) return true;
    if (f.departmentId || f.incomeTypeId || f.incomeSubTypeId) return true;
    return false;
  }
  private hasFiltersSpend(f?: SpendFilters) {
    if (!f) return false;
    if (f.start || f.end) return true;
    if (f.departmentId || f.spendTypeId || f.spendSubTypeId) return true;
    return false;
  }

  private async generatePDF(opts: {
    title: string,
    table: any[],
    summary: any,
    columns: Array<{ key: string; title: string; w: number; map?: (row: any) => any; align?: 'left'|'right' }>,
    filters: IncomeFilters | SpendFilters,
    filterKind: 'income' | 'spend',
  }): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 40, size: 'A4', layout: 'portrait' });
        this.registerFonts(doc);

        const chunks: Buffer[] = [];
        doc.on('data', c => chunks.push(c as Buffer));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Header
        this.addHeader(doc, `Reportes — ${opts.title}`);

        // Filtros (ocultos si no hay)
        const showFilters = opts.filterKind === 'income'
          ? this.hasFiltersIncome(opts.filters as IncomeFilters)
          : this.hasFiltersSpend(opts.filters as SpendFilters);
        if (showFilters) {
          if (opts.filterKind === 'income') this.addFiltersIncome(doc, opts.filters as IncomeFilters);
          else this.addFiltersSpend(doc, opts.filters as SpendFilters);
        }

        // Summary
        this.addSummaryCards(doc, opts.title, opts.summary);

        // Tabla
        this.addTable(doc, opts.columns, opts.table);

        // Footer
        this.addFooter(doc);

        doc.end();
      } catch (e) {
        reject(e);
      }
    });
  }

  // ================== BLOQUES VISUALES ==================
  private addHeader(doc: PDFKit.PDFDocument, title: string) {
    this.fontBold(doc);
    doc.fontSize(16).fillColor(this.UI.ink).text(title, 50, 40, { align: 'left' });

    this.fontRegular(doc);
    doc.fontSize(9).fillColor(this.UI.gray)
      .text(
        `Generado: ${new Date().toLocaleDateString('es-CR', { day:'2-digit', month:'2-digit', year:'numeric' })} ${new Date().toLocaleTimeString('es-CR')}`,
        50, 58, { align: 'right', width: doc.page.width - 100 }
      );

    doc.moveTo(50, 70).lineTo(doc.page.width - 50, 70)
      .strokeColor(this.UI.line).lineWidth(1).stroke();

    doc.y = 86;
  }

  private addFiltersIncome(doc: PDFKit.PDFDocument, f: IncomeFilters) {
    const y = doc.y, W = doc.page.width - 100, H = 84;
    doc.roundedRect(50, y, W, H, 12).lineWidth(1).strokeColor(this.UI.line).stroke();

    this.fontBold(doc);
    doc.fontSize(11).fillColor(this.UI.ink).text('Filtros', 65, y + 12);

    this.fontRegular(doc);
    doc.fontSize(9).fillColor(this.UI.gray);

    const start = f.start ? this.safeDate(f.start) : '—';
    const end   = f.end   ? this.safeDate(f.end)   : '—';
    const dep   = f.departmentId ? `#${f.departmentId}` : '—';
    const type  = f.incomeTypeId ? `#${f.incomeTypeId}`  : '—';
    const sub   = f.incomeSubTypeId ? `#${f.incomeSubTypeId}` : '—';

    doc.text(`Departamento: ${dep}`, 65, y + 32, { width: W / 2 - 30 });
    doc.text(`Tipo: ${type}`,       65 + W / 2, y + 32, { width: W / 4 - 30 });
    doc.text(`Subtipo: ${sub}`,     65 + (W * 3) / 4, y + 32, { width: W / 4 - 30 });

    doc.text(`Desde: ${start}`, 65, y + 52, { width: W / 2 - 30 });
    doc.text(`Hasta: ${end}`,   65 + W / 2, y + 52, { width: W / 2 - 30 });

    doc.y = y + H + 16;
  }

  private addFiltersSpend(doc: PDFKit.PDFDocument, f: SpendFilters) {
    const y = doc.y, W = doc.page.width - 100, H = 84;
    doc.roundedRect(50, y, W, H, 12).lineWidth(1).strokeColor(this.UI.line).stroke();

    this.fontBold(doc);
    doc.fontSize(11).fillColor(this.UI.ink).text('Filtros', 65, y + 12);

    this.fontRegular(doc);
    doc.fontSize(9).fillColor(this.UI.gray);

    const start = f.start ? this.safeDate(f.start) : '—';
    const end   = f.end   ? this.safeDate(f.end)   : '—';
    const dep   = f.departmentId ? `#${f.departmentId}` : '—';
    const type  = f.spendTypeId ? `#${f.spendTypeId}`  : '—';
    const sub   = f.spendSubTypeId ? `#${f.spendSubTypeId}` : '—';

    doc.text(`Departamento: ${dep}`, 65, y + 32, { width: W / 2 - 30 });
    doc.text(`Tipo: ${type}`,       65 + W / 2, y + 32, { width: W / 4 - 30 });
    doc.text(`Subtipo: ${sub}`,     65 + (W * 3) / 4, y + 32, { width: W / 4 - 30 });

    doc.text(`Desde: ${start}`, 65, y + 52, { width: W / 2 - 30 });
    doc.text(`Hasta: ${end}`,   65 + W / 2, y + 52, { width: W / 2 - 30 });

    doc.y = y + H + 16;
  }

  private addSummaryCards(doc: PDFKit.PDFDocument, _title: string, summary: any) {
    const GAP = 10;
    const W = (doc.page.width - 100 - GAP*2) / 3;
    const H = 88;
    const top = doc.y;

    const total = Number(summary?.grandTotal ?? 0);
    const depts = (summary?.byDepartment ?? []) as Array<{ departmentName:string; total:number }>;
    const topDept = [...depts].sort((a,b)=> (b.total||0)-(a.total||0))[0] ?? { departmentName:'—', total:0 };
    const anyGroup = (summary?.byIncomeSubType ?? summary?.bySpendSubType ?? []) as Array<{ total:number; [k:string]:any }>;
    const topGroup = [...anyGroup].sort((a,b)=> (b.total||0)-(a.total||0))[0] ?? { total:0 };
    const topGroupName = (topGroup as any).incomeSubTypeName ?? (topGroup as any).spendSubTypeName ?? '—';

    const drawCard = (x:number, label:string, valueText:string, palette:any, subtitle?:string) => {
      const prevY = doc.y;

      doc.roundedRect(x, top, W, H, 16).lineWidth(1).strokeColor(palette.ring).fillAndStroke(palette.bg);

      this.fontBold(doc);
      doc.fontSize(9).fillColor(palette.text).text(label.toUpperCase(), x + 14, top + 10);

      if (subtitle) {
        this.fontRegular(doc);
        doc.fontSize(10).fillColor(palette.text).text(subtitle, x + 14, top + 24, { width: W - 28, lineBreak:false });
      }

      const valueY = subtitle ? (top + 40) : (top + 28);
      this.fontBold(doc);
      doc.fontSize(18).fillColor(palette.text)
         .text(valueText, x + 14, valueY, { width: W - 28, align:'right', lineBreak:false });

      doc.y = prevY;
    };

    drawCard(50,               'Total',       this.formatCRC(total),                   this.UI.card.total);
    drawCard(50 + W + GAP,     'Top Depto',   this.formatCRC(Number(topDept.total||0)),this.UI.card.used,   topDept.departmentName);
    drawCard(50 + 2*(W + GAP), 'Top Subtipo', this.formatCRC(Number(topGroup.total||0)),this.UI.card.remain, topGroupName);

    doc.y = top + H + 16;
  }

  private addTable(
    doc: PDFKit.PDFDocument,
    columns: Array<{ key: string; title: string; w: number; map?: (row: any) => any; align?: 'left'|'right' }>,
    rows: any[]
  ) {
    this.fontBold(doc);
    doc.fontSize(12).fillColor(this.UI.ink).text('Detalle', 50, doc.y);
    doc.moveDown(0.5);

    const left = 50, right = doc.page.width - 50;
    const xs: number[] = []; let acc = left;
    for (const c of columns) { xs.push(acc); acc += c.w; }

    let y = doc.y + 6;

    // Header
    doc.roundedRect(left, y, right-left, 28, 12)
       .fillColor('#F9FAFB').strokeColor(this.UI.line).lineWidth(1).fillAndStroke();

    this.fontBold(doc);
    doc.fontSize(9).fillColor(this.UI.gray);
    columns.forEach((c, i) => {
      const align = (c.align ?? (/monto|total/i.test(c.title) ? 'right' : 'left')) as 'left'|'right';
      doc.text(c.title, xs[i] + 10, y + 9, { width: c.w - 20, align });
    });
    y += 34;

    const bottom = () => doc.page.height - doc.page.margins.bottom;
    const ensure = (rowH=22) => {
      if (y + rowH > bottom()) {
        doc.addPage(); y = doc.page.margins.top;
        doc.roundedRect(left, y, right-left, 28, 12)
           .fillColor('#F9FAFB').strokeColor(this.UI.line).lineWidth(1).fillAndStroke();
        this.fontBold(doc);
        doc.fontSize(9).fillColor(this.UI.gray);
        columns.forEach((c, i) => {
          const align = (c.align ?? (/monto|total/i.test(c.title) ? 'right' : 'left')) as 'left'|'right';
          doc.text(c.title, xs[i] + 10, y + 9, { width: c.w - 20, align });
        });
        y += 34;
      }
    };

    if (!rows.length) {
      ensure(40);
      this.fontRegular(doc);
      doc.fontSize(10).fillColor('#EF4444')
         .text('Sin resultados con los filtros aplicados.', left, y + 6);
      doc.y = y + 40;
      return;
    }

    // Filas
    rows.forEach((row, idx) => {
      ensure(24);

      // zebra
      doc.rect(left, y, right-left, 22)
         .fillColor(idx % 2 === 0 ? '#FFFFFF' : '#FAFAFA')
         .fill();

      this.fontRegular(doc);
      doc.fontSize(9).fillColor(this.UI.ink);

      columns.forEach((c, i) => {
        let raw = c.map ? c.map(row) : (row as any)[c.key];
        if (String(c.key).toLowerCase().includes('date')) raw = this.safeDate(raw);

        const isMoney = (c.align === 'right') || /monto|total|amount|used|remaining/i.test(c.title) || /amount|total/i.test(c.key);
        const txt = isMoney ? this.formatCRC(Number(raw ?? 0)) : String(raw ?? '—');
        const align: 'left'|'right' = (c.align ?? (isMoney ? 'right' : 'left')) as any;

        doc.text(txt, xs[i] + 10, y + 6, {
          width: c.w - 20,
          align,
          lineBreak: false,
        });
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

    this.fontRegular(doc);
    doc.fontSize(8).fillColor(this.UI.gray)
       .text('Sistema de Presupuesto — Reporte', 50, y, { width: doc.page.width - 100, align: 'center' });
  }
    // =================== EXCEL ===================
  
  async generateIncomeExcel(filters: IncomeFilters): Promise<Buffer> {
    const rows = await this.getIncomeTable(filters);
    const normalized = rows.map((r: any) => ({
      date: r.date?.toString().slice(0, 10) ?? '',
      department: r.department?.name ?? '',
      type: r.incomeType?.name ?? '',
      subType: r.incomeSubType?.name ?? '',
      amount: Number(r.amount ?? 0),
    }));

    return this.generateExcelWithColumns({
      sheetName: 'Ingresos',
      columns: [
        { header: 'FECHA',       key: 'date',       width: 14 },
        { header: 'DEPARTAMENTO',key: 'department', width: 26 },
        { header: 'TIPO',        key: 'type',       width: 24 },
        { header: 'SUBTIPO',     key: 'subType',    width: 28 },
        { header: 'MONTO',       key: 'amount',     width: 18, money: true },
      ],
      rows: normalized,
    });
  }

  async generateSpendExcel(filters: SpendFilters): Promise<Buffer> {
    const rows = await this.getSpendTable(filters);
    const normalized = rows.map((r: any) => ({
      date: r.date?.toString().slice(0, 10) ?? '',
      department: r.department?.name ?? '',
      type: r.spendType?.name ?? '',
      subType: r.spendSubType?.name ?? '',
      amount: Number(r.amount ?? 0),
    }));

    return this.generateExcelWithColumns({
      sheetName: 'Egresos',
      columns: [
        { header: 'FECHA',       key: 'date',       width: 14 },
        { header: 'DEPARTAMENTO',key: 'department', width: 26 },
        { header: 'TIPO',        key: 'type',       width: 24 },
        { header: 'SUBTIPO',     key: 'subType',    width: 28 },
        { header: 'MONTO',       key: 'amount',     width: 18, money: true },
      ],
      rows: normalized,
    });
  }

  private async generateExcelWithColumns(opts: {
    sheetName: string;
    columns: Array<{ header: string; key: string; width?: number; money?: boolean }>;
    rows: any[];
  }): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(opts.sheetName || 'Reporte');

    const moneyFmt = '"₡"#,##0.00;[Red]-"₡"#,##0.00';
    const headerFill: ExcelJS.Fill = { type: 'pattern', pattern:'solid', fgColor:{ argb: 'FFF8F9F3' } };
    const headerFont: Partial<ExcelJS.Font> = { name: 'Arial', size: 11, bold: true, color: { argb: 'FF5B732E' } };
    const borderAll: ExcelJS.Border = { style: 'thin', color: { argb: 'FFEAEFE0' } };

    // Columnas con formato opcional de moneda
    sheet.columns = opts.columns.map(c => ({
      header: c.header,
      key: c.key,
      width: c.width ?? 18,
      style: c.money ? { numFmt: moneyFmt } : {},
    }));

    // Header
    sheet.getRow(1).eachCell((cell) => {
      cell.fill = headerFill;
      cell.font = headerFont;
      cell.border = { top: borderAll, left: borderAll, bottom: borderAll, right: borderAll };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    // Filas
    sheet.addRows(opts.rows);

    // Bordes + alineación
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      row.eachCell((cell, colNumber) => {
        cell.border = { top: borderAll, left: borderAll, bottom: borderAll, right: borderAll };
        cell.alignment = { vertical: 'middle', horizontal: colNumber === 1 ? 'left' : 'right' };
        if (!cell.font?.bold) cell.font = { name: 'Arial', size: 10 };
      });
    });

    const out = await workbook.xlsx.writeBuffer();
    return Buffer.isBuffer(out) ? out as Buffer : Buffer.from(out as ArrayBuffer);
  }

}
