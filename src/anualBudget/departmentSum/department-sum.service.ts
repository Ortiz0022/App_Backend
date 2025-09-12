// src/anualBudget/departmentSum/department-sum.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { DepartmentSum } from './entities/department-sum.entity';
import { FiscalYear } from 'src/anualBudget/fiscalYear/entities/fiscal-year.entity';
import { SpendTypeByDepartment } from 'src/anualBudget/spendTypeByDepartment/entities/spend-type-by-department.entity';
import { CreateDepartmentSumDto } from './dto/createDepartmentSum';

@Injectable()
export class DepartmentSumService {
  constructor(
    @InjectRepository(DepartmentSum)
    private readonly sumRepo: Repository<DepartmentSum>,
    @InjectRepository(FiscalYear)
    private readonly fyRepo: Repository<FiscalYear>,
    @InjectRepository(SpendTypeByDepartment)
    private readonly stdRepo: Repository<SpendTypeByDepartment>,
  ) {}

  /** Crea o actualiza el snapshot para un año fiscal */
  async upsert(dto: CreateDepartmentSumDto) {
    const fy = await this.fyRepo.findOne({ where: { id: dto.fiscalYearId } }); // ajusta a id_FiscalYear si tu PK se llama así
    if (!fy) throw new NotFoundException('FiscalYear not found');

    // Suma de TODOS los departamentos (filas TOTAL: spendType IS NULL)
    const raw = await this.stdRepo
      .createQueryBuilder('d')
      .select('COALESCE(SUM(d.amountDepSpend), 0)', 'totalSpend')
      .where('d.Id_TypeSpend IS NULL') // usamos la fila "total por depto"
      .getRawOne<{ totalSpend: string | number }>();

    const totalSpend = Number(raw?.totalSpend ?? 0).toFixed(2);

    // (Opcional) totalIncome: por ahora lo dejamos a 0.00
    const totalIncome = Number(0).toFixed(2);

    let snapshot = await this.sumRepo.findOne({ where: { fiscalYear: { id: fy.id } } as any });
    if (!snapshot) {
      snapshot = this.sumRepo.create({
        fiscalYear: fy,
        totalIncome: totalIncome,
        totalSpend: totalSpend,
      });
    } else {
      snapshot.totalIncome = totalIncome;
      snapshot.totalSpend = totalSpend;
    }

    return this.sumRepo.save(snapshot);
  }

  /** Recalcula (solo totalSpend) para el año fiscal indicado */
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
