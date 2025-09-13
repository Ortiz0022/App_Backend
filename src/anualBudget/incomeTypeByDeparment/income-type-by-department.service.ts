// src/anualBudget/incomeTypeByDeparment/income-type-by-department.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { IncomeTypeByDepartment } from './entities/income-type-by-department.entity';
import { FiscalYear } from '../fiscalYear/entities/fiscal-year.entity';
import { Department } from '../department/entities/department.entity';
import { IncomeSubType } from '../incomeSubType/entities/income-sub-type.entity';
import { Income } from '../income/entities/income.entity';

@Injectable()
export class IncomeTypeByDepartmentService {
constructor(
  @InjectRepository(IncomeTypeByDepartment) private readonly repo: Repository<IncomeTypeByDepartment>,
  @InjectRepository(FiscalYear)             private readonly fyRepo: Repository<FiscalYear>,
  @InjectRepository(Department)             private readonly deptRepo: Repository<Department>,
  @InjectRepository(Income)                 private readonly incRepo: Repository<Income>, // 👈
) {}

  /**
   * Recalcula el total por departamento (amountDepIncome)
   * para TODO el año fiscal indicado.
   */
  async recalcAllForFiscalYear(fiscalYearId: number): Promise<IncomeTypeByDepartment[]> {
  const fy = await this.fyRepo.findOne({ where: { id: fiscalYearId } });
  if (!fy) throw new NotFoundException('FiscalYear not found');

  const rows = await this.incRepo
    .createQueryBuilder('i')
    .innerJoin('i.incomeSubType', 's')
    .innerJoin('s.incomeType', 't')
    .innerJoin('t.department', 'd')
    .where('i.date >= :start AND i.date <= :end', { start: fy.start_date, end: fy.end_date })
    .select('d.id', 'departmentId')
    .addSelect('COALESCE(SUM(i.amount),0)', 'total')
    .groupBy('d.id')
    .getRawMany<{ departmentId: number; total: string }>();

  // Upsert de departamentos con movimientos
  for (const r of rows) {
    const deptId = Number(r.departmentId);
    let snap = await this.repo.findOne({
      where: {
        department: { id: deptId } as any,
        fiscalYear: { id: fy.id } as any,
      } as any,
    });

    if (!snap) {
      snap = this.repo.create({
        department: { id: deptId } as any,
        fiscalYear: { id: fy.id } as any,
        amountDepIncome: '0.00',
      });
    }

    snap.amountDepIncome = r.total ?? '0';
    await this.repo.save(snap);
  }

  // Asegurar filas en 0 para departamentos sin movimientos
  const allDepts = await this.deptRepo.find();
  for (const d of allDepts) {
    const exist = await this.repo.findOne({
      where: {
        department: { id: d.id } as any,
        fiscalYear: { id: fy.id } as any,
      } as any,
    });

    if (!exist) {
      await this.repo.save(
        this.repo.create({
          department: { id: d.id } as any,
          fiscalYear: { id: fy.id } as any,
          amountDepIncome: '0.00',
        }),
      );
    }
  }

  return this.findByFiscalYear(fiscalYearId);
}


  /** Lista los snapshots por año fiscal */
  findByFiscalYear(fiscalYearId: number): Promise<IncomeTypeByDepartment[]> {
    return this.repo.find({
      where: { fiscalYear: { id: fiscalYearId } as any },
      order: { id: 'ASC' },
    });
  }

  /** Obtiene un snapshot (departamento, año fiscal) */
  findOne(departmentId: number, fiscalYearId: number): Promise<IncomeTypeByDepartment | null> {
    return this.repo.findOne({
      where: {
        department: { id: departmentId } as any,
        fiscalYear: { id: fiscalYearId } as any,
      } as any,
    });
  }
}
