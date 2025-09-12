// src/anualBudget/incomeTypeByDeparment/income-type-by-department.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { IncomeTypeByDepartment } from './entities/income-type-by-department.entity';
import { IncomeType } from 'src/anualBudget/incomeType/entities/income-type.entity';

@Injectable()
export class IncomeTypeByDepartmentService {
  constructor(
    @InjectRepository(IncomeTypeByDepartment)
    private readonly repo: Repository<IncomeTypeByDepartment>,
    @InjectRepository(IncomeType)
    private readonly typeRepo: Repository<IncomeType>,
  ) {}

  /** Asegura fila TOTAL (incomeType = NULL) y la recalcula */
  async recalcDepartmentTotal(departmentId: number) {
    // SUM de todos los IncomeType.amountIncome del depto
    const raw = await this.typeRepo
      .createQueryBuilder('t')
      .select('COALESCE(SUM(t.amountIncome), 0)', 'total')
      .where('t.id_Department = :id', { id: departmentId })
      .getRawOne<{ total: string | number }>();

    const total = Number(raw?.total ?? 0).toFixed(2);

    // upsert de la fila TOTAL
    let row = await this.repo.findOne({
      where: { department: { id: departmentId } as any, incomeType: IsNull() } as any,
      relations: ['department', 'incomeType'],
    });

    if (!row) {
      row = this.repo.create({
        department: { id: departmentId } as any,
        incomeType: null,
        amountDepIncome: total,
      });
    } else {
      row.amountDepIncome = total;
    }

    return this.repo.save(row);
  }

  /** Recalcula TODOS los departamentos que tengan IncomeTypes */
  async recalcAll() {
    const ids = await this.typeRepo
      .createQueryBuilder('t')
      .select('DISTINCT t.id_Department', 'id')
      .getRawMany<{ id: number }>();

    const out: IncomeTypeByDepartment[] = [];
    for (const r of ids) out.push(await this.recalcDepartmentTotal(Number(r.id)));
    return out;
  }

  /** Helpers que tu IncomeTypeService ya invoca */
  async upsert(payload: { departmentId: number; incomeTypeId: number }) {
    // este upsert mantiene (dept, incomeType) si decides usar filas por par; no toca el TOTAL
    let row = await this.repo.findOne({
      where: {
        department: { id: payload.departmentId } as any,
        incomeType: { id: payload.incomeTypeId } as any,
      } as any,
      relations: ['department', 'incomeType'],
    });

    if (!row) {
      row = this.repo.create({
        department: { id: payload.departmentId } as any,
        incomeType: { id: payload.incomeTypeId } as any,
        amountDepIncome: '0.00',
      });
      await this.repo.save(row);
    }
    return row;
  }

  async create(payload: { departmentId: number; incomeTypeId: number }) {
    return this.upsert(payload);
  }

  async removeByComposite(departmentId: number, incomeTypeId: number) {
    await this.repo.delete({
      department: { id: departmentId } as any,
      incomeType: { id: incomeTypeId } as any,
    } as any);
  }

  async removeByIncomeType(incomeTypeId: number) {
    await this.repo.delete({ incomeType: { id: incomeTypeId } } as any);
  }
}
