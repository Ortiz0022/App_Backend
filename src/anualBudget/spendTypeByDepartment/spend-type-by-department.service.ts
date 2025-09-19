import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SpendTypeByDepartment } from './entities/spend-type-by-department.entity';
import { FiscalYear } from '../fiscalYear/entities/fiscal-year.entity';
import { Department } from '../department/entities/department.entity';
import { Spend } from '../spend/entities/spend.entity';

@Injectable()
export class SpendTypeByDepartmentService {
  constructor(
    @InjectRepository(SpendTypeByDepartment) private readonly repo: Repository<SpendTypeByDepartment>,
    @InjectRepository(FiscalYear)            private readonly fyRepo: Repository<FiscalYear>,
    @InjectRepository(Department)            private readonly deptRepo: Repository<Department>,
    @InjectRepository(Spend)                 private readonly spendRepo: Repository<Spend>,
  ) {}

  /**
   * Recalcula y persiste el total de egresos por departamento (amountDepSpend)
   * para TODO el año fiscal indicado.
   */
  async recalcAllForFiscalYear(fiscalYearId: number): Promise<SpendTypeByDepartment[]> {
    const fy = await this.fyRepo.findOne({ where: { id: fiscalYearId } });
    if (!fy) throw new NotFoundException('FiscalYear not found');

    // Sumatoria por Department usando spend -> spendSubType -> spendType -> department
    const rows = await this.spendRepo
      .createQueryBuilder('sp')
      .innerJoin('sp.spendSubType', 'sst')
      .innerJoin('sst.spendType', 'st')
      .innerJoin('st.department', 'd')
      .where('sp.date >= :start AND sp.date <= :end', { start: fy.start_date, end: fy.end_date })
      .select('d.id', 'departmentId')
      .addSelect('COALESCE(SUM(sp.amount), 0)', 'total')
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
          amountDepSpend: '0.00',
        });
      }

      // Asegurar formato string con 2 decimales
      const totalStr = Number(r.total ?? 0).toFixed(2);
      snap.amountDepSpend = totalStr;
      await this.repo.save(snap);
    }

    // Asegurar filas en 0 para departamentos sin movimientos en el FY
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
            amountDepSpend: '0.00',
          }),
        );
      }
    }

    return this.findByFiscalYear(fiscalYearId);
  }

  /** Lista snapshots por año fiscal */
  findByFiscalYear(fiscalYearId: number): Promise<SpendTypeByDepartment[]> {
    return this.repo.find({
      where: { fiscalYear: { id: fiscalYearId } as any },
      order: { id: 'ASC' },
    });
  }

  /** Obtiene un snapshot (departmentId, fiscalYearId) */
  findOne(departmentId: number, fiscalYearId: number): Promise<SpendTypeByDepartment | null> {
    return this.repo.findOne({
      where: {
        department: { id: departmentId } as any,
        fiscalYear: { id: fiscalYearId } as any,
      } as any,
    });
  }
}
