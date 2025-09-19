import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Department } from '../department/entities/department.entity';

// ====== INCOME (lo tuyo existente) ======
import { Income } from '../income/entities/income.entity';
import { IncomeSubType } from '../incomeSubType/entities/income-sub-type.entity';
import { IncomeType } from '../incomeType/entities/income-type.entity';

// ====== SPEND (nuevo) ======
import { Spend } from '../spend/entities/spend.entity';
import { SpendSubType } from '../spendSubType/entities/spend-sub-type.entity';
import { SpendType } from '../spendType/entities/spend-type.entity';

type IncomeFilters = {
  start?: string;
  end?: string;
  departmentId?: number;
  incomeTypeId?: number;
  incomeSubTypeId?: number;
};

type SpendFilters = {
  start?: string;
  end?: string;
  departmentId?: number;
  spendTypeId?: number;
  spendSubTypeId?: number;
};

@Injectable()
export class ReportService {
  constructor(
    // INCOME
    @InjectRepository(Income) private readonly incomeRepo: Repository<Income>,
    @InjectRepository(IncomeSubType) private readonly subTypeRepo: Repository<IncomeSubType>,
    @InjectRepository(IncomeType) private readonly typeRepo: Repository<IncomeType>,
    @InjectRepository(Department) private readonly deptRepo: Repository<Department>,

    // SPEND
    @InjectRepository(Spend) private readonly spendRepo: Repository<Spend>,
    @InjectRepository(SpendSubType) private readonly sSubTypeRepo: Repository<SpendSubType>,
    @InjectRepository(SpendType) private readonly sTypeRepo: Repository<SpendType>,
  ) {}

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

  // ================= INCOME (tuyo) =================
  async getIncomeTable(filters: IncomeFilters) {
    const qb = this.incomeRepo
      .createQueryBuilder('i')
      .leftJoin(IncomeSubType, 'st', 'st.id = i.incomeSubTypeId')
      .leftJoin(IncomeType, 't', 't.id = st.incomeTypeId')
      .leftJoin(Department, 'd', 'd.id = t.departmentId');

    this.applyDateFiltersIncome(qb, filters);

    if (filters.departmentId) qb.andWhere('t.departmentId = :dep', { dep: filters.departmentId });
    if (filters.incomeSubTypeId) qb.andWhere('i.incomeSubTypeId = :st', { st: filters.incomeSubTypeId });
    if (filters.incomeTypeId) qb.andWhere('t.id = :t', { t: filters.incomeTypeId });

    qb
      .select([
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
      .orderBy('i.date', 'ASC')
      .addOrderBy('d.name', 'ASC')
      .addOrderBy('t.name', 'ASC')
      .addOrderBy('st.name', 'ASC');

    const raw = await qb.getRawMany<{
      id: number;
      date: string;
      amount: string;
      departmentId: number; departmentName: string;
      incomeTypeId: number; incomeTypeName: string;
      incomeSubTypeId: number; incomeSubTypeName: string;
    }>();

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
      .select([
        'st.id AS incomeSubTypeId',
        'st.name AS incomeSubTypeName',
        'COALESCE(SUM(i.amount),0) AS total',
      ])
      .groupBy('st.id')
      .addGroupBy('st.name')
      .orderBy('st.name', 'ASC')
      .getRawMany<{ incomeSubTypeId: number; incomeSubTypeName: string; total: string }>();

    const byDepartment = await base.clone()
      .select([
        'd.id AS departmentId',
        'd.name AS departmentName',
        'COALESCE(SUM(i.amount),0) AS total',
      ])
      .groupBy('d.id')
      .addGroupBy('d.name')
      .orderBy('d.name', 'ASC')
      .getRawMany<{ departmentId: number; departmentName: string; total: string }>();

    const grand = await base.clone()
      .select('COALESCE(SUM(i.amount),0)', 'grand')
      .getRawOne<{ grand: string }>();

    return {
      byIncomeSubType: byIncomeSubType.map(x => ({
        incomeSubTypeId: x.incomeSubTypeId,
        incomeSubTypeName: x.incomeSubTypeName,
        total: Number(x.total || 0),
      })),
      byDepartment: byDepartment.map(x => ({
        departmentId: x.departmentId,
        departmentName: x.departmentName,
        total: Number(x.total || 0),
      })),
      grandTotal: Number(grand?.grand || 0),
    };
  }

  // ================= SPEND (nuevo) =================
  async getSpendTable(filters: SpendFilters) {
    const qb = this.spendRepo
      .createQueryBuilder('s')
      .leftJoin(SpendSubType, 'sst', 'sst.id = s.spendSubTypeId')
      .leftJoin(SpendType, 'st', 'st.id = sst.spendTypeId')
      .leftJoin(Department, 'd', 'd.id = st.departmentId');

    this.applyDateFiltersSpend(qb, filters);

    if (filters.departmentId) qb.andWhere('st.departmentId = :dep', { dep: filters.departmentId });
    if (filters.spendSubTypeId) qb.andWhere('s.spendSubTypeId = :sst', { sst: filters.spendSubTypeId });
    if (filters.spendTypeId) qb.andWhere('st.id = :t', { t: filters.spendTypeId });

    qb
      .select([
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
      .orderBy('s.date', 'ASC')
      .addOrderBy('d.name', 'ASC')
      .addOrderBy('st.name', 'ASC')
      .addOrderBy('sst.name', 'ASC');

    const raw = await qb.getRawMany<{
      id: number;
      date: string;
      amount: string;
      departmentId: number; departmentName: string;
      spendTypeId: number; spendTypeName: string;
      spendSubTypeId: number; spendSubTypeName: string;
    }>();

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
      .select([
        'sst.id AS spendSubTypeId',
        'sst.name AS spendSubTypeName',
        'COALESCE(SUM(s.amount),0) AS total',
      ])
      .groupBy('sst.id')
      .addGroupBy('sst.name')
      .orderBy('sst.name', 'ASC')
      .getRawMany<{ spendSubTypeId: number; spendSubTypeName: string; total: string }>();

    const byDepartment = await base.clone()
      .select([
        'd.id AS departmentId',
        'd.name AS departmentName',
        'COALESCE(SUM(s.amount),0) AS total',
      ])
      .groupBy('d.id')
      .addGroupBy('d.name')
      .orderBy('d.name', 'ASC')
      .getRawMany<{ departmentId: number; departmentName: string; total: string }>();

    const grand = await base.clone()
      .select('COALESCE(SUM(s.amount),0)', 'grand')
      .getRawOne<{ grand: string }>();

    return {
      bySpendSubType: bySpendSubType.map(x => ({
        spendSubTypeId: x.spendSubTypeId,
        spendSubTypeName: x.spendSubTypeName,
        total: Number(x.total || 0),
      })),
      byDepartment: byDepartment.map(x => ({
        departmentId: x.departmentId,
        departmentName: x.departmentName,
        total: Number(x.total || 0),
      })),
      grandTotal: Number(grand?.grand || 0),
    };
  }
}
