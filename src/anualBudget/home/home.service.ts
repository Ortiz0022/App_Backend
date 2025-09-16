import { DataSource } from 'typeorm';
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
    // Build date filter conditions
    const dateFilter = this.buildDateFilter(period.startDate, period.endDate);

    // Calculate real incomes and spends
    const realIncomes = await this.calculateRealIncomes(dateFilter);
    const realSpends = await this.calculateRealSpends(dateFilter);
    
    // Calculate projected incomes and spends
    const projectedIncomes = await this.calculateProjectedIncomes(dateFilter);
    const projectedSpends = await this.calculateProjectedSpends(dateFilter);

    // Calculate balances
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

  private async calculateRealIncomes(dateFilter: any): Promise<number> {
    const result = await this.ds.getRepository(Income)
      .createQueryBuilder('income')
      .select('SUM(income.amount)', 'total')
      .where(dateFilter)
      .getRawOne();
    
    return parseFloat(result?.total || 0);
  }

  private async calculateRealSpends(dateFilter: any): Promise<number> {
    const result = await this.ds.getRepository(Spend)
      .createQueryBuilder('spend')
      .select('SUM(spend.amount)', 'total')
      .where(dateFilter)
      .getRawOne();
    
    return parseFloat(result?.total || 0);
  }

  private async calculateProjectedIncomes(dateFilter: any): Promise<number> {
    const result = await this.ds.getRepository(PIncome)
      .createQueryBuilder('pIncome')
      .select('SUM(pIncome.amount)', 'total')
      .where(dateFilter)
      .getRawOne();
    
    return parseFloat(result?.total || 0);
  }

 private async calculateProjectedSpends(_dateFilter: any): Promise<number> {
    try {
      // Try to import PSpend dynamically to avoid compilation errors if it doesn't exist
      const result = await this.ds.getRepository(PSpend)
        .createQueryBuilder('pSpend')
        .select('SUM(pSpend.amount)', 'total')
        .where(_dateFilter)
        .getRawOne();
      
      return parseFloat(result?.total || 0);
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
    
      // ======= FIX DE NOMBRES CUANDO SOLO HAY PROYECCIÓN =======
      if (groupBy === 'department') {
        // 1) Catálogo de Department (id -> name)
        const depts = await this.ds.getRepository(Department)
          .find({ select: ['id', 'name'] });
        const nameByDept = new Map<number, string>(depts.map(d => [d.id, d.name])); // Department.name existe, ver entidad. :contentReference[oaicite:0]{index=0}
    
        // 2) Mapear reales y proyectados
        const rMap = new Map<number, number>(real.map(r => [Number(r.id), Number(r.real) || 0]));
        const pMap = new Map<number, number>(proj.map(p => [Number(p.id), Number(p.projected) || 0]));
    
        // 3) Unión de ids
        const ids = new Set<number>([...rMap.keys(), ...pMap.keys()]);
    
        // 4) Construir salida con nombre siempre desde catálogo
        const out = Array.from(ids).map(id => {
          const realN = rMap.get(id) ?? 0;
          const projN = pMap.get(id) ?? 0;
          const name = nameByDept.get(id) ?? ''; // si no está, vacío (pero normalmente sí está)
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
    
      // ========== merge default (type/subtype) ==========
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
    
      // (Opcional) agregar ids que solo estén en proyección para type/subtype:
      for (const pr of proj) {
        const id = Number(pr.id);
        if (!out.find(x => x.id === id)) {
          out.push({ id, name: '', real: 0, projected: Number(pr.projected) || 0, diff: -Number(pr.projected || 0) });
        }
      }
    
      return out;
    }
    
}
