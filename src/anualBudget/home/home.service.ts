import { Between, DataSource } from 'typeorm';
import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { Income } from 'src/anualBudget/income/entities/income.entity';
import { Spend } from 'src/anualBudget/spend/entities/spend.entity';
import { PIncome } from 'src/anualBudget/pIncome/entities/pIncome.entity';
import { PIncomeSubType } from 'src/anualBudget/pIncomeSubType/entities/pincome-sub-type.entity';
import { PIncomeType } from 'src/anualBudget/pIncomeType/entities/pincome-type.entity';
import { Totals } from './dto/home.dto';
import { Department } from '../department/entities/department.entity';
import { PSpend } from '../pSpend/entities/p-spend.entity';

@Injectable()
export class HomeService {
  private readonly logger = new Logger(HomeService.name);

  constructor(private readonly ds: DataSource) {}

  async getTotals(period: { startDate?: string; endDate?: string }): Promise<Totals> {
    const range = this.getDateRange(period.startDate, period.endDate);

    const realIncomes = await this.calculateRealIncomes(range);
    const realSpends = await this.calculateRealSpends(range);

    const projectedIncomes = await this.calculateProjectedIncomes(range);
    const projectedSpends = await this.calculateProjectedSpends(range);

    const realBalance = realIncomes - realSpends;
    const projectedBalance = projectedIncomes - projectedSpends;

    return {
      incomes: realIncomes,
      spends: realSpends,
      balance: realBalance,
      projectedIncomes,
      projectedSpends,
      projectedBalance,
    };
  }

 
  private buildDateFilter(startDate?: string, endDate?: string) {
    const where: any = {};
    if (startDate) where.date = { $gte: new Date(startDate) };
    if (endDate) {
      where.date = where.date || {};
      where.date.$lte = new Date(endDate);
    }
    return where;
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

  private async calculateRealIncomes(range: { startDate?: Date; endDate?: Date }): Promise<number> {
    const qb = this.ds
      .getRepository(Income)
      .createQueryBuilder('income')
      .select('SUM(income.amount)', 'total');

    if (range.startDate && range.endDate) {
      qb.andWhere('income.date BETWEEN :s AND :e', { s: range.startDate, e: range.endDate });
    } else if (range.startDate) {
      qb.andWhere('income.date >= :s', { s: range.startDate });
    } else if (range.endDate) {
      qb.andWhere('income.date <= :e', { e: range.endDate });
    }

    const result = await qb.getRawOne<{ total: string }>();
    return parseFloat(result?.total || '0');
  }

  private async calculateRealSpends(range: { startDate?: Date; endDate?: Date }): Promise<number> {
    const qb = this.ds
      .getRepository(Spend)
      .createQueryBuilder('spend')
      .select('SUM(spend.amount)', 'total');

    if (range.startDate && range.endDate) {
      qb.andWhere('spend.date BETWEEN :s AND :e', { s: range.startDate, e: range.endDate });
    } else if (range.startDate) {
      qb.andWhere('spend.date >= :s', { s: range.startDate });
    } else if (range.endDate) {
      qb.andWhere('spend.date <= :e', { e: range.endDate });
    }

    const result = await qb.getRawOne<{ total: string }>();
    return parseFloat(result?.total || '0');
  }

  private async calculateProjectedIncomes(range: { startDate?: Date; endDate?: Date }): Promise<number> {
    const qb = this.ds
      .getRepository(PIncome)
      .createQueryBuilder('pIncome')
      .select('SUM(pIncome.amount)', 'total');

    if (range.startDate && range.endDate) {
      qb.andWhere('pIncome.date BETWEEN :s AND :e', { s: range.startDate, e: range.endDate });
    } else if (range.startDate) {
      qb.andWhere('pIncome.date >= :s', { s: range.startDate });
    } else if (range.endDate) {
      qb.andWhere('pIncome.date <= :e', { e: range.endDate });
    }

    const result = await qb.getRawOne<{ total: string }>();
    return parseFloat(result?.total || '0');
  }

  private async calculateProjectedSpends(range: { startDate?: Date; endDate?: Date }): Promise<number> {
    try {
      const qb = this.ds
        .getRepository(PSpend)
        .createQueryBuilder('pSpend')
        .select('SUM(pSpend.amount)', 'total');

      // (Sin filtro de fecha aquí; PSpend no tiene 'date' en tu entidad)
      const result = await qb.getRawOne<{ total: string }>();
      return parseFloat(result?.total || '0');
    } catch (error) {
      this.logger.warn('PSpend entity not found. Projected spends will be set to 0.');
      return 0;
    }
  }

  public async getIncomeComparison(
    period: { startDate?: string; endDate?: string },
    groupByParam?: string
  ) {
    const groupBy = (groupByParam ?? 'department').toLowerCase() as
      'department' | 'type' | 'subtype';

    // ===== REAL =====
    let realQB = this.ds.getRepository(Income)
      .createQueryBuilder('i')
      .innerJoin('i.incomeSubType', 's')
      .innerJoin('s.incomeType', 't');

    // ===== PROYECCIÓN =====
    let projQB = this.ds.getRepository(PIncome)
      .createQueryBuilder('pi')
      .innerJoin('pi.pIncomeSubType', 'ps')
      .innerJoin('ps.pIncomeType', 'pt');

    let idExprReal = '';
    let nameExprReal = '';
    let idExprProj = '';

    if (groupBy === 'department') {
      realQB = realQB.innerJoin('t.department', 'd');
      projQB = projQB.innerJoin('pt.department', 'dd');

      idExprReal = 'd.id';
      nameExprReal = 'd.name';
      idExprProj = 'dd.id';
    } else if (groupBy === 'type') {
      idExprReal = 't.id';
      nameExprReal = 't.name';
      idExprProj = 'pt.id';
    } else {
      idExprReal = 's.id';
      nameExprReal = 's.name';
      idExprProj = 'ps.id';
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
      const depts = await this.ds.getRepository(Department)
        .find({ select: ['id', 'name'] });
      const nameByDept = new Map<number, string>(depts.map(d => [d.id, d.name]));

      const rMap = new Map<number, number>(real.map(r => [Number(r.id), Number(r.real) || 0]));
      const pMap = new Map<number, number>(proj.map(p => [Number(p.id), Number(p.projected) || 0]));

      const ids = new Set<number>([...rMap.keys(), ...pMap.keys()]);

      const out = Array.from(ids).map(id => {
        const realN = rMap.get(id) ?? 0;
        const projN = pMap.get(id) ?? 0;
        const name = nameByDept.get(id) ?? '';
        return {
          id,
          name,
          real: realN,
          projected: projN,
          diff: realN - projN,
        };
      });

      return out;
    }

    const pMap = new Map<number, number>(proj.map(r => [Number(r.id), Number(r.projected) || 0]));
    const out = real.map(r => {
      const realN = Number(r.real) || 0;
      const projected = pMap.get(Number(r.id)) ?? 0;
      return {
        id: Number(r.id),
        name: r.name,
        real: realN,
        projected,
        diff: realN - projected,
      };
    });

    for (const pr of proj) {
      const id = Number(pr.id);
      if (!out.find(x => x.id === id)) {
        out.push({ id, name: '', real: 0, projected: Number(pr.projected) || 0, diff: -Number(pr.projected || 0) });
      }
    }

    return out;
  }

  public async getSpendComparison(
    period: { startDate?: string; endDate?: string },
    groupByParam?: string
  ) {
    const groupBy = (groupByParam ?? 'department').toLowerCase() as
      'department' | 'type' | 'subtype';

    const range = this.getDateRange(period.startDate, period.endDate);

    // ===== REAL SPEND =====
    let realQB = this.ds.getRepository(Spend)
      .createQueryBuilder('m')
      .innerJoin('m.spendSubType', 'ss')
      .innerJoin('ss.spendType', 'st');

   

    let idExprReal = '';
    let nameExprReal = '';
    let idExprProj = '';

    if (groupBy === 'department') {
      realQB = realQB.innerJoin('st.department', 'd');
      idExprReal = 'd.id';
      nameExprReal = 'd.name';
      idExprProj = 'dd.id';
    } else if (groupBy === 'type') {
      idExprReal = 'st.id';
      nameExprReal = 'st.name';
      idExprProj = 'pst.id';
    } else {
      idExprReal = 'ss.id';
      nameExprReal = 'ss.name';
      idExprProj = 'pss.id';
    }

    // Fechas SOLO para reales (Spend). PSpend no lleva filtro por fecha.
    if (range.startDate && range.endDate) {
      realQB.andWhere('m.date BETWEEN :s AND :e', { s: range.startDate, e: range.endDate });
    } else if (range.startDate) {
      realQB.andWhere('m.date >= :s', { s: range.startDate });
    } else if (range.endDate) {
      realQB.andWhere('m.date <= :e', { e: range.endDate });
    }

    const real = await realQB
      .select(idExprReal, 'id')
      .addSelect(nameExprReal, 'name')
      .addSelect('SUM(m.amount)', 'real')
      .groupBy(idExprReal)
      .addGroupBy(nameExprReal)
      .getRawMany<{ id: number; name: string; real: string }>();

    // ===== PROYECCIÓN =====
    let proj: { id: number; projected: string }[] = [];
    try {
      let projQB = this.ds.getRepository(PSpend)
        .createQueryBuilder('pm')
        .innerJoin('pm.subType', 'pss')        
        .innerJoin('pss.type', 'pst');         

      if (groupBy === 'department') {
        projQB = projQB.innerJoin('pst.department', 'dd');
      }

      proj = await projQB
        .select(idExprProj, 'id')
        .addSelect('SUM(pm.amount)', 'projected')
        .groupBy(idExprProj)
        .getRawMany<{ id: number; projected: string }>();
    } catch (e) {
      this.logger.warn('No se pudo resolver join de PSpend → PSpendSubType/PSpendType. Proyección=0.');
      proj = [];
    }

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
        return {
          id,
          name,
          real: realN,
          projected: projN,
          diff: realN - projN,
        };
      });
    }

    const pMap = new Map<number, number>(proj.map(r => [Number(r.id), Number(r.projected) || 0]));
    const out = real.map(r => {
      const realN = Number(r.real) || 0;
      const projected = pMap.get(Number(r.id)) ?? 0;
      return {
        id: Number(r.id),
        name: r.name,
        real: realN,
        projected,
        diff: realN - projected,
      };
    });

    for (const pr of proj) {
      const id = Number(pr.id);
      if (!out.find(x => x.id === id)) {
        out.push({
          id,
          name: '',
          real: 0,
          projected: Number(pr.projected) || 0,
          diff: -Number(pr.projected || 0),
        });
      }
    }

    return out;
  }
}
