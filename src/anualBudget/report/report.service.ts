import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import PDFDocument from 'pdfkit';

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

  // ================= HELPERS =================
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
      .leftJoin('i.incomeSubType', 'st')      // join con IncomeSubType
      .leftJoin('st.incomeType', 't')         // join con IncomeType
      .leftJoin('t.department', 'd');         // join con Department
  
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
      .groupBy('st.id').addGroupBy('st.name').orderBy('st.name','ASC')
      .getRawMany<any>();

    const byDepartment = await base.clone()
      .select(['d.id AS departmentId','d.name AS departmentName','COALESCE(SUM(i.amount),0) AS total'])
      .groupBy('d.id').addGroupBy('d.name').orderBy('d.name','ASC')
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
    .leftJoin('s.spendSubType', 'sst')       // join con SpendSubType
    .leftJoin('sst.spendType', 'st')         // join con SpendType
    .leftJoin('st.department', 'd');         // join con Department

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
      .groupBy('sst.id').addGroupBy('sst.name').orderBy('sst.name','ASC')
      .getRawMany<any>();

    const byDepartment = await base.clone()
      .select(['d.id AS departmentId','d.name AS departmentName','COALESCE(SUM(s.amount),0) AS total'])
      .groupBy('d.id').addGroupBy('d.name').orderBy('d.name','ASC')
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
  private readonly UI = {
    ink: '#111827',
    gray: '#6B7280',
    line: '#E5E7EB',
    card: {
      total:   { bg:'#EEF2FF', ring:'#E0E7FF', text:'#3730A3', bar:'#4F46E5', barSoft:'#C7D2FE' },
      used:    { bg:'#ECFDF5', ring:'#D1FAE5', text:'#065F46', bar:'#10B981', barSoft:'#A7F3D0' },
      remain:  { bg:'#FFFBEB', ring:'#FEF3C7', text:'#92400E', bar:'#F59E0B', barSoft:'#FDE68A' },
    }
  };

  async generateIncomePDF(filters: IncomeFilters) {
    const table = await this.getIncomeTable(filters);
    const summary = await this.getIncomeSummary(filters);
    return this.generatePDF({
      title: 'Ingresos',
      table,
      summary,
      columns: [
        { key:'date', title:'FECHA', w:100 },
        { key:'department', title:'DEPARTAMENTO', w:120, map:r=>r.department.name },
        { key:'incomeType', title:'TIPO', w:100, map:r=>r.incomeType.name },
        { key:'incomeSubType', title:'SUBTIPO', w:100, map:r=>r.incomeSubType.name },
        { key:'amount', title:'MONTO', w:100, map:r=>r.amount.toLocaleString('es-CR',{style:'currency',currency:'CRC'}) },
      ]
    });
  }

  async generateSpendPDF(filters: SpendFilters) {
    const table = await this.getSpendTable(filters);
    const summary = await this.getSpendSummary(filters);
    return this.generatePDF({
      title: 'Gastos',
      table,
      summary,
      columns: [
        { key:'date', title:'FECHA', w:100 },
        { key:'department', title:'DEPARTAMENTO', w:120, map:r=>r.department.name },
        { key:'spendType', title:'TIPO', w:100, map:r=>r.spendType.name },
        { key:'spendSubType', title:'SUBTIPO', w:100, map:r=>r.spendSubType.name },
        { key:'amount', title:'MONTO', w:100, map:r=>r.amount.toLocaleString('es-CR',{style:'currency',currency:'CRC'}) },
      ]
    });
  }

  private async generatePDF(opts: { title:string, table:any[], summary:any, columns:{key:string,title:string,w:number,map?:(row:any)=>string}[] }) {
    return new Promise<Buffer>((resolve, reject)=>{
      try{
        const doc = new PDFDocument({ margin:40, size:'A4', layout:'portrait' });
        const chunks: Buffer[] = [];
        doc.on('data', chunk=>chunks.push(chunk));
        doc.on('end', ()=>resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // HEADER
        doc.font('Helvetica-Bold').fontSize(16).fillColor(this.UI.ink)
           .text(`Reporte — ${opts.title}`, 50, 40, { align:'left' });
        doc.font('Helvetica').fontSize(9).fillColor(this.UI.gray)
           .text(`Generado: ${new Date().toLocaleString('es-CR')}`, 50,58,{ align:'right', width:doc.page.width-100 });
        doc.moveTo(50,70).lineTo(doc.page.width-50,70).strokeColor(this.UI.line).lineWidth(1).stroke();
        doc.y=86;

        // SUMMARY CARDS
        const GAP=10, W=(doc.page.width-100-GAP*2)/3, H=72, top=doc.y;
        const drawCard=(x:number,label:string,value:number,palette:any,pct?:number)=>{
          doc.roundedRect(x,top,W,H,16).lineWidth(1).strokeColor(palette.ring).fillAndStroke(palette.bg);
          doc.font('Helvetica-Bold').fontSize(9).fillColor(palette.text).text(label.toUpperCase(), x+14, top+10);
          doc.font('Helvetica-Bold').fontSize(18).fillColor(palette.text)
             .text(value.toLocaleString('es-CR',{style:'currency',currency:'CRC',minimumFractionDigits:2}), x+14, top+26, {width:W-28});
          const barW=W-28, barY=top+H-16;
          doc.roundedRect(x+14,barY,barW,6,3).fillColor(palette.barSoft).fill();
          const p=Math.max(0,Math.min(100,pct??100));
          doc.roundedRect(x+14,barY,Math.max(6,(barW*p)/100),6,3).fillColor(palette.bar).fill();
        };
        const usedPct=opts.summary.byDepartment?.reduce((s:any,r:any)=>s+r.total,0)/opts.summary.grandTotal*100||0;
        drawCard(50,'Total',opts.summary.grandTotal,this.UI.card.total,100);
        drawCard(50+W+GAP,'Usado',opts.summary.byDepartment?.reduce((s:any,r:any)=>s+r.total,0)||0,this.UI.card.used,usedPct);
        drawCard(50+2*(W+GAP),'Restante',opts.summary.grandTotal-(opts.summary.byDepartment?.reduce((s:any,r:any)=>s+r.total,0)||0),this.UI.card.remain,100-usedPct);
        doc.y=top+H+16;

        // TABLE HEADER
        const left=50,right=doc.page.width-50;
        const x:number[]=[];
        opts.columns.reduce((acc,c,i)=>{const xx=i===0?left:acc+opts.columns[i-1].w;x.push(xx);return xx;},0);
        let y=doc.y+6;
        doc.roundedRect(left,y,right-left,28,12).fillColor('#F9FAFB').strokeColor(this.UI.line).lineWidth(1).fillAndStroke();
        doc.font('Helvetica-Bold').fontSize(9).fillColor(this.UI.gray);
        opts.columns.forEach((c,i)=>doc.text(c.title,x[i]+10,y+9,{width:c.w-20,align:'left'}));
        y+=34;

        const bottom=()=>doc.page.height-doc.page.margins.bottom;
        const ensure=(rowH=22)=>{if(y+rowH>bottom()){doc.addPage();y=doc.page.margins.top;}};
        if(opts.table.length===0){ensure(40);doc.font('Helvetica').fontSize(10).fillColor('#EF4444').text('Sin resultados con los filtros aplicados.',left,y+6);doc.y=y+40;doc.end();return;}

        opts.table.forEach((row,idx)=>{
          ensure(24);
          doc.rect(left,y,right-left,22).fillColor(idx%2===0?'#FFFFFF':'#FAFAFA').fill();
          doc.font('Helvetica').fontSize(9).fillColor(this.UI.ink);
          opts.columns.forEach((c,i)=>{
            const val=c.map?c.map(row):(row as any)[c.key]??'—';
            doc.text(String(val),x[i]+10,y+6,{width:c.w-20,align:'left'});
          });
          y+=22;
          doc.moveTo(left,y).lineTo(right,y).strokeColor(this.UI.line).lineWidth(0.5).stroke();
        });

        doc.end();
      }catch(e){reject(e);}
    });
  }
}
