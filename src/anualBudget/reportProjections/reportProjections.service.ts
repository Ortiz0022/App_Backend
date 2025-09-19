import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Department } from '../department/entities/department.entity';

// ===== INCOME (real) =====
import { Income } from '../income/entities/income.entity';
import { IncomeSubType } from '../incomeSubType/entities/income-sub-type.entity';
import { IncomeType } from '../incomeType/entities/income-type.entity';

// ===== INCOME (projected) =====
import { PIncome } from '../pIncome/entities/pIncome.entity';
import { PIncomeSubType } from '../pIncomeSubType/entities/pincome-sub-type.entity';
import { PIncomeType } from '../pIncomeType/entities/pincome-type.entity';

// ===== SPEND (real) =====
import { Spend } from '../spend/entities/spend.entity';
import { SpendSubType } from '../spendSubType/entities/spend-sub-type.entity';
import { SpendType } from '../spendType/entities/spend-type.entity';

// ===== SPEND (projected) =====
import { PSpend } from '../pSpend/entities/p-spend.entity';
import { PSpendSubType } from '../pSpendSubType/entities/p-spend-sub-type.entity';
import { PSpendType } from '../pSpendType/entities/p-spend-type.entity';

type BaseFilters = {
  // Reales usan start/end (YYYY-MM-DD)
  start?: string;
  end?: string;

  // Si tus p* NO tienen columnas de año/mes, deja estos sin usar
  // fiscalYearId?: number;
  // month?: number;

  departmentId?: number;
};

type IncomeFilters = BaseFilters & {
  incomeTypeId?: number;
  incomeSubTypeId?: number;
};

type SpendFilters = BaseFilters & {
  spendTypeId?: number;
  spendSubTypeId?: number;
};

@Injectable()
export class ReportProjectionsService {
  private readonly logger = new Logger(ReportProjectionsService.name);

  constructor(
    // reales
    @InjectRepository(Income) private readonly incomeRepo: Repository<Income>,
    @InjectRepository(Spend) private readonly spendRepo: Repository<Spend>,

    // catálogos reales
    @InjectRepository(IncomeSubType) private readonly iSubTypeRepo: Repository<IncomeSubType>,
    @InjectRepository(IncomeType) private readonly iTypeRepo: Repository<IncomeType>,
    @InjectRepository(SpendSubType) private readonly sSubTypeRepo: Repository<SpendSubType>,
    @InjectRepository(SpendType) private readonly sTypeRepo: Repository<SpendType>,

    // proyecciones
    @InjectRepository(PIncome) private readonly pIncomeRepo: Repository<PIncome>,
    @InjectRepository(PSpend) private readonly pSpendRepo: Repository<PSpend>,

    // catálogos proyección
    @InjectRepository(PIncomeSubType) private readonly pISubTypeRepo: Repository<PIncomeSubType>,
    @InjectRepository(PIncomeType) private readonly pITypeRepo: Repository<PIncomeType>,
    @InjectRepository(PSpendSubType) private readonly pSSubTypeRepo: Repository<PSpendSubType>,
    @InjectRepository(PSpendType) private readonly pSTypeRepo: Repository<PSpendType>,

    @InjectRepository(Department) private readonly deptRepo: Repository<Department>,
  ) {}

  // ========================= INCOME =========================
  private async realIncomeAgg(filters: IncomeFilters) {
    const qb = this.incomeRepo.createQueryBuilder('i')
      .leftJoin('i.incomeSubType', 'st')
      .leftJoin('st.incomeType', 't')
      .leftJoin('t.department', 'd');

    if (filters.start && filters.end) qb.andWhere('i.date BETWEEN :from AND :to', { from: filters.start, to: filters.end });
    else if (filters.start) qb.andWhere('i.date >= :from', { from: filters.start });
    else if (filters.end) qb.andWhere('i.date <= :to', { to: filters.end });

    if (filters.departmentId) qb.andWhere('d.id = :dep', { dep: filters.departmentId });
    if (filters.incomeTypeId) qb.andWhere('t.id = :t', { t: filters.incomeTypeId });
    if (filters.incomeSubTypeId) qb.andWhere('st.id = :st', { st: filters.incomeSubTypeId });

    try {
      return await qb
        .select([
          'st.id AS subTypeId',
          'st.name AS subTypeName',
          'COALESCE(SUM(i.amount),0) AS realTotal',
        ])
        .groupBy('st.id')
        .addGroupBy('st.name')
        .getRawMany<{ subTypeId:number; subTypeName:string; realTotal:string }>();
    } catch (err) {
      this.logger.error(err);
      throw new BadRequestException('Error consultando ingresos reales');
    }
  }

  private async projectedIncomeAgg(filters: IncomeFilters) {
    const qb = this.pIncomeRepo.createQueryBuilder('pi')
      .leftJoin('pi.pIncomeSubType', 'pst')
      .leftJoin('pst.pIncomeType', 'pt')
      .leftJoin('pt.department', 'd');

    // IMPORTANTE: no filtramos por fiscalYearId/month porque tu tabla no los tiene
    if (filters.departmentId) qb.andWhere('d.id = :dep', { dep: filters.departmentId });
    if (filters.incomeTypeId) qb.andWhere('pt.id = :t', { t: filters.incomeTypeId });
    if (filters.incomeSubTypeId) qb.andWhere('pst.id = :pst', { pst: filters.incomeSubTypeId });

    try {
      return await qb
        .select([
          'pst.id AS subTypeId',
          'pst.name AS subTypeName',
          'COALESCE(SUM(pi.amount),0) AS projTotal',
        ])
        .groupBy('pst.id')
        .addGroupBy('pst.name')
        .getRawMany<{ subTypeId:number; subTypeName:string; projTotal:string }>();
    } catch (err) {
      this.logger.error(err);
      throw new BadRequestException('Error consultando ingresos proyectados');
    }
  }

  async compareIncome(filters: IncomeFilters) {
    const [real, proj] = await Promise.all([
      this.realIncomeAgg(filters),
      this.projectedIncomeAgg(filters),
    ]);

    const map = new Map<number, { name:string; real:number; proj:number }>();
    real.forEach(r => map.set(r.subTypeId, { name: r.subTypeName, real: Number(r.realTotal||0), proj: 0 }));
    proj.forEach(p => {
      const prev = map.get(p.subTypeId);
      if (prev) prev.proj = Number(p.projTotal||0);
      else map.set(p.subTypeId, { name: p.subTypeName, real: 0, proj: Number(p.projTotal||0) });
    });

    const rows = Array.from(map.entries()).map(([id, v]) => ({
      incomeSubTypeId: id,
      name: v.name,
      real: v.real,
      projected: v.proj,
      difference: Number((v.proj - v.real).toFixed(2)),
    }));

    const totals = rows.reduce(
      (acc, r) => {
        acc.real += r.real; acc.projected += r.projected; acc.difference += r.difference;
        return acc;
      },
      { real: 0, projected: 0, difference: 0 },
    );

    return { filters, rows, totals };
  }

  // ========================= SPEND =========================
  private async realSpendAgg(filters: SpendFilters) {
    const qb = this.spendRepo.createQueryBuilder('s')
      .leftJoin('s.spendSubType', 'sst')
      .leftJoin('sst.spendType', 'st')
      .leftJoin('st.department', 'd');

    if (filters.start && filters.end) qb.andWhere('s.date BETWEEN :from AND :to', { from: filters.start, to: filters.end });
    else if (filters.start) qb.andWhere('s.date >= :from', { from: filters.start });
    else if (filters.end) qb.andWhere('s.date <= :to', { to: filters.end });

    if (filters.departmentId) qb.andWhere('d.id = :dep', { dep: filters.departmentId });
    if (filters.spendTypeId) qb.andWhere('st.id = :t', { t: filters.spendTypeId });
    if (filters.spendSubTypeId) qb.andWhere('sst.id = :sst', { sst: filters.spendSubTypeId });

    try {
      return await qb
        .select([
          'sst.id AS subTypeId',
          'sst.name AS subTypeName',
          'COALESCE(SUM(s.amount),0) AS realTotal',
        ])
        .groupBy('sst.id')
        .addGroupBy('sst.name')
        .getRawMany<{ subTypeId:number; subTypeName:string; realTotal:string }>();
    } catch (err) {
      this.logger.error(err);
      throw new BadRequestException('Error consultando egresos reales');
    }
  }

  private async projectedSpendAgg(filters: SpendFilters) {
  // FK real en tu esquema:
  // ps.subTypeId -> psst.id
  // psst.typeId  -> pst.id
  const qb = this.pSpendRepo.createQueryBuilder('ps')
    .leftJoin(PSpendSubType, 'psst', 'psst.id = ps.subTypeId')
    .leftJoin(PSpendType, 'pst', 'pst.id = psst.typeId')
    .leftJoin(Department, 'd', 'd.id = pst.departmentId');

  if (filters.departmentId) qb.andWhere('d.id = :dep', { dep: filters.departmentId });
  if (filters.spendTypeId) qb.andWhere('pst.id = :t', { t: filters.spendTypeId });
  if (filters.spendSubTypeId) qb.andWhere('psst.id = :psst', { psst: filters.spendSubTypeId });

  return qb
    .select([
      'psst.id AS subTypeId',
      'psst.name AS subTypeName',
      'COALESCE(SUM(ps.amount),0) AS projTotal',
    ])
    .groupBy('psst.id')
    .addGroupBy('psst.name')
    .getRawMany<{ subTypeId:number; subTypeName:string; projTotal:string }>();
}

  async compareSpend(filters: SpendFilters) {
    const [real, proj] = await Promise.all([
      this.realSpendAgg(filters),
      this.projectedSpendAgg(filters),
    ]);

    const map = new Map<number, { name:string; real:number; proj:number }>();
    real.forEach(r => map.set(r.subTypeId, { name: r.subTypeName, real: Number(r.realTotal||0), proj: 0 }));
    proj.forEach(p => {
      const prev = map.get(p.subTypeId);
      if (prev) prev.proj = Number(p.projTotal||0);
      else map.set(p.subTypeId, { name: p.subTypeName, real: 0, proj: Number(p.projTotal||0) });
    });

    const rows = Array.from(map.entries()).map(([id, v]) => ({
      spendSubTypeId: id,
      name: v.name,
      real: v.real,
      projected: v.proj,
      difference: Number((v.proj - v.real).toFixed(2)),
    }));

    const totals = rows.reduce(
      (acc, r) => {
        acc.real += r.real; acc.projected += r.projected; acc.difference += r.difference;
        return acc;
      },
      { real: 0, projected: 0, difference: 0 },
    );

    return { filters, rows, totals };
  }
}
