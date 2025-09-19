import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from '../department/entities/department.entity';
import { Income } from '../income/entities/income.entity';
import { IncomeSubType } from '../incomeSubType/entities/income-sub-type.entity';
import { IncomeType } from '../incomeType/entities/income-type.entity';

type Filters = {
  start?: string; // YYYY-MM-DD
  end?: string;   // YYYY-MM-DD
  departmentId?: number;
  incomeTypeId?: number;
  incomeSubTypeId?: number;
};

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(Income) private readonly incomeRepo: Repository<Income>,
    @InjectRepository(IncomeSubType) private readonly subTypeRepo: Repository<IncomeSubType>,
    @InjectRepository(IncomeType) private readonly typeRepo: Repository<IncomeType>,
    @InjectRepository(Department) private readonly deptRepo: Repository<Department>,
  ) {}

  private applyDateFilters(qb: any, f: Filters) {
    if (f.start && f.end) qb.andWhere('i.date BETWEEN :from AND :to', { from: f.start, to: f.end });
    else if (f.start) qb.andWhere('i.date >= :from', { from: f.start });
    else if (f.end) qb.andWhere('i.date <= :to', { to: f.end });
  }

  /** Tabla de detalle */
  async getIncomeTable(filters: Filters) {
    const qb = this.incomeRepo
      .createQueryBuilder('i')
      .leftJoin(IncomeSubType, 'st', 'st.id = i.incomeSubTypeId')
      .leftJoin(IncomeType, 't', 't.id = st.incomeTypeId')
      .leftJoin(Department, 'd', 'd.id = t.departmentId'); // 👈 join correcto

    this.applyDateFilters(qb, filters);

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

  /** Totales por SubTipo, por Departamento y Global */
  async getIncomeSummary(filters: Filters) {
    const base = this.incomeRepo
      .createQueryBuilder('i')
      .leftJoin(IncomeSubType, 'st', 'st.id = i.incomeSubTypeId')
      .leftJoin(IncomeType, 't', 't.id = st.incomeTypeId')
      .leftJoin(Department, 'd', 'd.id = t.departmentId'); // 👈 join correcto

    this.applyDateFilters(base, filters);

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
}
