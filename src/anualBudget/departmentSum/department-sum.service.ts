// src/anualBudget/departmentSum/department-sum.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { DepartmentSum } from './entities/department-sum.entity';
import { FiscalYear } from 'src/anualBudget/fiscalYear/entities/fiscal-year.entity';
import { SpendTypeByDepartment } from 'src/anualBudget/spendTypeByDepartment/entities/spend-type-by-department.entity';
import { IncomeTypeByDepartment } from 'src/anualBudget/incomeTypeByDeparment/entities/income-type-by-department.entity'; // 👈 NUEVO

@Injectable()
export class DepartmentSumService {
  constructor(
    @InjectRepository(DepartmentSum)
    private readonly sumRepo: Repository<DepartmentSum>,
    @InjectRepository(FiscalYear)
    private readonly fyRepo: Repository<FiscalYear>,
    @InjectRepository(SpendTypeByDepartment)
    private readonly stdRepo: Repository<SpendTypeByDepartment>,
    @InjectRepository(IncomeTypeByDepartment)                        // 👈 NUEVO
    private readonly itbdRepo: Repository<IncomeTypeByDepartment>,  // 👈 NUEVO
  ) {}

  /** Crea/actualiza snapshot para el año fiscal con totalSpend y totalIncome */
  async upsert(dto: { fiscalYearId: number }) {
    const fy = await this.fyRepo.findOne({ where: { id: dto.fiscalYearId } });
    if (!fy) throw new NotFoundException('FiscalYear not found');

    // Sumar TOTALES por departamento:
    //  - Gastos: SpendTypeByDepartment.amountDepSpend donde Id_TypeSpend IS NULL
    //  - Ingresos: IncomeTypeByDepartment.amountDepIncome donde Id_TypeIncome IS NULL
    const [spendRaw, incomeRaw] = await Promise.all([
      this.stdRepo
        .createQueryBuilder('s')
        .select('COALESCE(SUM(s.amountDepSpend), 0)', 'totalSpend')
        .where('s.Id_TypeSpend IS NULL')
        .getRawOne<{ totalSpend: string | number }>(),
      this.itbdRepo
        .createQueryBuilder('i')
        .select('COALESCE(SUM(i.amountDepIncome), 0)', 'totalIncome')
        .where('i.Id_TypeIncome IS NULL')
        .getRawOne<{ totalIncome: string | number }>(),
    ]);

    const totalSpend  = Number(spendRaw?.totalSpend  ?? 0).toFixed(2);
    const totalIncome = Number(incomeRaw?.totalIncome ?? 0).toFixed(2);

    let snapshot = await this.sumRepo.findOne({ where: { fiscalYear: { id: fy.id } } as any });
    if (!snapshot) {
      snapshot = this.sumRepo.create({ fiscalYear: fy, totalIncome, totalSpend });
    } else {
      snapshot.totalIncome = totalIncome;
      snapshot.totalSpend  = totalSpend;
    }
    return this.sumRepo.save(snapshot);
  }

  recalc(fiscalYearId: number) {
    return this.upsert({ fiscalYearId });
  }

  findAll() {
    return this.sumRepo.find({ order: { id: 'ASC' } });
  }

  findOneByFiscalYear(fiscalYearId: number) {
    return this.sumRepo.findOne({ where: { fiscalYear: { id: fiscalYearId } } as any });
  }

  remove(id: number) {
    return this.sumRepo.delete(id);
  }
}
