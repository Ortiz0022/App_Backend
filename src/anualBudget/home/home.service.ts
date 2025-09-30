import { DataSource } from 'typeorm';
import { Injectable, Logger } from '@nestjs/common';
import { Income } from 'src/anualBudget/income/entities/income.entity';
import { Spend } from 'src/anualBudget/spend/entities/spend.entity';
import { PIncome } from 'src/anualBudget/pIncome/entities/pIncome.entity';
import { Totals } from './dto/home.dto';
import { Department } from '../department/entities/department.entity';
import { PSpend } from '../pSpend/entities/p-spend.entity';
import { FiscalYearService } from '../fiscalYear/fiscal-year.service';

@Injectable()
export class HomeService {
  private readonly logger = new Logger(HomeService.name);

  constructor(
    private readonly ds: DataSource,
    private readonly fyService: FiscalYearService,
  ) {}

  async getTotals(period: { startDate?: string; endDate?: string }, fyIdFromHeader?: number): Promise<Totals> {
  const range = this.getDateRange(period.startDate, period.endDate);

  // si no viene rango y sí viene fyId del header, úsalo; si no, cae al activo
  let fyId = fyIdFromHeader;
  if (!range.startDate && !range.endDate && !fyId) {
    const fy = await this.fyService.getActiveOrCurrent();
    fyId = fy?.id;
  }

  const realIncomes      = await this.calculateRealIncomes(range, fyId);
  const realSpends       = await this.calculateRealSpends(range, fyId);
  const projectedIncomes = await this.calculateProjectedIncomes(range, fyId);
  const projectedSpends  = await this.calculateProjectedSpends(range, fyId);
        return {
      incomes: realIncomes,
      spends: realSpends,
      balance: realIncomes - realSpends,
      projectedIncomes,
      projectedSpends,
      projectedBalance: projectedIncomes - projectedSpends,
    };
  }

  private getDateRange(startDate?: string, endDate?: string) {
    const range: { startDate?: Date; endDate?: Date } = {};
    if (startDate) {
      range.startDate = new Date(startDate);
      range.startDate.setHours(0, 0, 0, 0);
    }
    if (endDate) {
      range.endDate = new Date(endDate);
      range.endDate.setHours(23, 59, 59, 999);
    }
    return range;
  }

  private async calculateRealIncomes(range: { startDate?: Date; endDate?: Date }, fyId?: number): Promise<number> {
  const qb = this.ds.getRepository(Income)
    .createQueryBuilder('income')
    .select('COALESCE(SUM(income.amount), 0)', 'total');

  if (fyId) qb.andWhere('income.fiscalYearId = :fyId', { fyId }); // 🔸 clave
  if (range.startDate && range.endDate) qb.andWhere('income.date BETWEEN :s AND :e', { s: range.startDate, e: range.endDate });
  else if (range.startDate) qb.andWhere('income.date >= :s', { s: range.startDate });
  else if (range.endDate) qb.andWhere('income.date <= :e', { e: range.endDate });

  const incRaw = await qb.getRawOne<{ total?: string }>();
  return Number(incRaw?.total ?? 0);
}
  

  private async calculateRealSpends(range: { startDate?: Date; endDate?: Date }, fyId?: number): Promise<number> {
  const qb = this.ds.getRepository(Spend)
    .createQueryBuilder('spend')
    .select('COALESCE(SUM(spend.amount), 0)', 'total');

  if (fyId) qb.andWhere('spend.fiscalYearId = :fyId', { fyId }); // 🔸
  if (range.startDate && range.endDate) qb.andWhere('spend.date BETWEEN :s AND :e', { s: range.startDate, e: range.endDate });
  else if (range.startDate) qb.andWhere('spend.date >= :s', { s: range.startDate });
  else if (range.endDate) qb.andWhere('spend.date <= :e', { e: range.endDate });

  const r = await qb.getRawOne<{ total?: string }>();
  return Number(r?.total ?? 0);
}

  private async calculateProjectedIncomes(
  range: { startDate?: Date; endDate?: Date },
  fyId?: number
): Promise<number> {
  const qb = this.ds.getRepository(PIncome)
    .createQueryBuilder('pi')
    .select('COALESCE(SUM(pi.amount), 0)', 'total');

  if (fyId) {
    qb.andWhere('pi.fiscalYearId = :fyId', { fyId });
    // ⚠️ NO aplicar filtro por fecha porque muchos p_income tienen date = null
  } else {
    if (range.startDate && range.endDate) qb.andWhere('pi.date BETWEEN :s AND :e', { s: range.startDate, e: range.endDate });
    else if (range.startDate) qb.andWhere('pi.date >= :s', { s: range.startDate });
    else if (range.endDate) qb.andWhere('pi.date <= :e', { e: range.endDate });
  }

  const r = await qb.getRawOne<{ total?: string }>();
  return Number(r?.total ?? 0);
}

  private async calculateProjectedSpends(_range: { startDate?: Date; endDate?: Date }, fyId?: number): Promise<number> {
  try {
    const qb = this.ds.getRepository(PSpend)
      .createQueryBuilder('pm')
      .select('COALESCE(SUM(pm.amount), 0)', 'total');

    if (fyId) qb.andWhere('pm.fiscalYearId = :fyId', { fyId }); // 🔸

    const r = await qb.getRawOne<{ total?: string }>();
    return Number(r?.total ?? 0);
  } catch {
    this.logger.warn('PSpend entity not found. Projected spends will be set to 0.');
    return 0;
  }
}

  /** ==================== TABLA: Incomes ==================== */
  public async getIncomeComparison(
    period: { startDate?: string; endDate?: string },
    groupByParam?: string,
    fyIdFromHeader?: number,             // 👈 nuevo parámetro
  ) {
    const groupBy = (groupByParam ?? 'department').toLowerCase() as 'department' | 'type' | 'subtype';
    const range = this.getDateRange(period.startDate, period.endDate);

    // 👇 Preferir el FY del header si viene; si no, caer al activo cuando no hay rango
    let fyId: number | undefined = Number.isFinite(fyIdFromHeader!) ? fyIdFromHeader : undefined;
    if (!fyId && !range.startDate && !range.endDate) {
      const fy = await this.fyService.getActiveOrCurrent();
      fyId = fy?.id;
      if (fy) { range.startDate = new Date(fy.start_date); range.endDate = new Date(fy.end_date); }
    }

    // Reales
    let realQB = this.ds.getRepository(Income)
      .createQueryBuilder('i')
      .innerJoin('i.incomeSubType', 's')
      .innerJoin('s.incomeType', 't');

    if (fyId) realQB.andWhere('i.fiscalYearId = :fyId', { fyId });
    if (range.startDate && range.endDate) realQB.andWhere('i.date BETWEEN :s AND :e', { s: range.startDate, e: range.endDate });
    else if (range.startDate) realQB.andWhere('i.date >= :s', { s: range.startDate });
    else if (range.endDate) realQB.andWhere('i.date <= :e', { e: range.endDate });

    // Proyección
    let projQB = this.ds.getRepository(PIncome)
      .createQueryBuilder('pi')
      .innerJoin('pi.pIncomeSubType', 'ps')
      .innerJoin('ps.pIncomeType', 'pt');

    if (fyId) {
      projQB.andWhere('pi.fiscalYearId = :fyId', { fyId }); // cuando hay FY, no filtrar por fecha en p_income
    } else {
      if (range.startDate && range.endDate) projQB.andWhere('pi.date BETWEEN :s AND :e', { s: range.startDate, e: range.endDate });
      else if (range.startDate) projQB.andWhere('pi.date >= :s', { s: range.startDate });
      else if (range.endDate) projQB.andWhere('pi.date <= :e', { e: range.endDate });
    }

    let idExprReal = '';
    let nameExprReal = '';
    let idExprProj = '';
    if (groupBy === 'department') {
      realQB = realQB.innerJoin('t.department', 'd');
      projQB = projQB.innerJoin('pt.department', 'dd');
      idExprReal = 'd.id'; nameExprReal = 'd.name'; idExprProj = 'dd.id';
    } else if (groupBy === 'type') {
      idExprReal = 't.id'; nameExprReal = 't.name'; idExprProj = 'pt.id';
    } else {
      idExprReal = 's.id'; nameExprReal = 's.name'; idExprProj = 'ps.id';
    }

    const real = await realQB
      .select(idExprReal, 'id')
      .addSelect(nameExprReal, 'name')
      .addSelect('SUM(i.amount)', 'real')
      .groupBy(idExprReal)
      .addGroupBy(nameExprReal)
      .getRawMany<{ id: number; name: string; real: string }>();

    const proj = await projQB
      .select(idExprProj, 'id')
      .addSelect('SUM(pi.amount)', 'projected')
      .groupBy(idExprProj)
      .getRawMany<{ id: number; projected: string }>();

    if (groupBy === 'department') {
      const depts = await this.ds.getRepository(Department).find({ select: ['id', 'name'] });
      const nameByDept = new Map<number, string>(depts.map(d => [d.id, d.name]));
      const rMap = new Map<number, number>(real.map(r => [Number(r.id), Number(r.real) || 0]));
      const pMap = new Map<number, number>(proj.map(p => [Number(p.id), Number(p.projected) || 0]));
      const ids = new Set<number>([...rMap.keys(), ...pMap.keys()]);
      return Array.from(ids).map(id => {
        const realN = rMap.get(id) ?? 0;
        const projN = pMap.get(id) ?? 0;
        const name = nameByDept.get(id) ?? '';
        return { id, name, real: realN, projected: projN, diff: realN - projN };
      });
    }

    const pMap = new Map<number, number>(proj.map(r => [Number(r.id), Number(r.projected) || 0]));
    const out = real.map(r => {
      const realN = Number(r.real) || 0;
      const projected = pMap.get(Number(r.id)) ?? 0;
      return { id: Number(r.id), name: r.name, real: realN, projected, diff: realN - projected };
    });
    for (const pr of proj) {
      const id = Number(pr.id);
      if (!out.find(x => x.id === id)) out.push({ id, name: '', real: 0, projected: Number(pr.projected) || 0, diff: -(Number(pr.projected) || 0) });
    }
    return out;
  }

  /** ==================== TABLA: Spends ==================== */
 public async getSpendComparison(
    period: { startDate?: string; endDate?: string },
    groupByParam?: string,
    fyIdFromHeader?: number,             // 👈 nuevo parámetro
  ) {
    const groupBy = (groupByParam ?? 'department').toLowerCase() as 'department' | 'type' | 'subtype';
    const range = this.getDateRange(period.startDate, period.endDate);

    // 👇 Preferir el FY del header si viene; si no, caer al activo cuando no hay rango
    let fyId: number | undefined = Number.isFinite(fyIdFromHeader!) ? fyIdFromHeader : undefined;
    if (!fyId && !range.startDate && !range.endDate) {
      const fy = await this.fyService.getActiveOrCurrent();
      fyId = fy?.id;
      if (fy) { range.startDate = new Date(fy.start_date); range.endDate = new Date(fy.end_date); }
    }

    // ===== REAL =====
    let realQB = this.ds.getRepository(Spend)
      .createQueryBuilder('m')
      .innerJoin('m.spendSubType', 'ss')
      .innerJoin('ss.spendType', 'st');

    let idExprReal = '';
    let nameExprReal = '';
    let idExprProj = '';

    if (groupBy === 'department') {
      realQB = realQB.innerJoin('st.department', 'd');
      idExprReal = 'd.id'; nameExprReal = 'd.name'; idExprProj = 'dd.id';
    } else if (groupBy === 'type') {
      idExprReal = 'st.id'; nameExprReal = 'st.name'; idExprProj = 'pst.id';
    } else {
      idExprReal = 'ss.id'; nameExprReal = 'ss.name'; idExprProj = 'pss.id';
    }

    if (fyId) realQB.andWhere('m.fiscalYearId = :fyId', { fyId });
    if (range.startDate && range.endDate) realQB.andWhere('m.date BETWEEN :s AND :e', { s: range.startDate, e: range.endDate });
    else if (range.startDate) realQB.andWhere('m.date >= :s', { s: range.startDate });
    else if (range.endDate) realQB.andWhere('m.date <= :e', { e: range.endDate });

    const real = await realQB
      .select(idExprReal, 'id')
      .addSelect(nameExprReal, 'name')
      .addSelect('SUM(m.amount)', 'real')
      .groupBy(idExprReal)
      .addGroupBy(nameExprReal)
      .getRawMany<{ id: number; name: string; real: string }>();

    // ===== PROYECCIÓN =====
    let projQB = this.ds.getRepository(PSpend)
      .createQueryBuilder('pm')
      .innerJoin('pm.subType', 'pss')
      .innerJoin('pss.type', 'pst');

    if (groupBy === 'department') projQB = projQB.innerJoin('pst.department', 'dd');
    if (fyId) projQB.andWhere('pm.fiscalYearId = :fyId', { fyId });

    const proj = await projQB
      .select(idExprProj, 'id')
      .addSelect('SUM(pm.amount)', 'projected')
      .groupBy(idExprProj)
      .getRawMany<{ id: number; projected: string }>();

    if (groupBy === 'department') {
      const depts = await this.ds.getRepository(Department).find({ select: ['id', 'name'] });
      const nameByDept = new Map<number, string>(depts.map(d => [d.id, d.name]));
      const rMap = new Map<number, number>(real.map(r => [Number(r.id), Number(r.real) || 0]));
      const pMap = new Map<number, number>(proj.map(p => [Number(p.id), Number(p.projected) || 0]));
      const ids = new Set<number>([...rMap.keys(), ...pMap.keys()]);
      return Array.from(ids).map(id => {
        const realN = rMap.get(id) ?? 0;
        const projN = pMap.get(id) ?? 0;
        const name = nameByDept.get(id) ?? '';
        return { id, name, real: realN, projected: projN, diff: realN - projN };
      });
    }

    const pMap = new Map<number, number>(proj.map(r => [Number(r.id), Number(r.projected) || 0]));
    const out = real.map(r => {
      const realN = Number(r.real) || 0;
      const projected = pMap.get(Number(r.id)) ?? 0;
      return { id: Number(r.id), name: r.name, real: realN, projected, diff: realN - projected };
    });
    for (const pr of proj) {
      const id = Number(pr.id);
      if (!out.find(x => x.id === id)) out.push({ id, name: '', real: 0, projected: Number(pr.projected) || 0, diff: -(Number(pr.projected) || 0) });
    }
    return out;
  }
}