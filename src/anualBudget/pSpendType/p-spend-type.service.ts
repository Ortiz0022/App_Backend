// src/anualBudget/pSpendType/p-spend-type.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PSpendType } from './entities/p-spend-type.entity';
import { PSpend } from '../pSpend/entities/p-spend.entity';
import { Department } from '../department/entities/department.entity';

@Injectable()
export class PSpendTypeService {
  constructor(
    @InjectRepository(PSpendType) private typeRepo: Repository<PSpendType>,
    @InjectRepository(PSpend) private pSpendRepo: Repository<PSpend>,
    @InjectRepository(Department) private depRepo: Repository<Department>,
  ) {}

  /**
   * Devuelve los tipos con amountPSpend = SUM(ps.amount) por tipo.
   * Filtros:
   * - departmentId: limita los tipos al departamento
   * - fiscalYearId: limita la suma al año fiscal
   */
  async findAll(departmentId?: number, fiscalYearId?: number) {
    // 1) Traer los tipos (opcional por department)
    const types = await this.typeRepo.find({
      where: departmentId ? { department: { id: departmentId } as any } : {},
    });
    if (types.length === 0) return types;

    const typeIds = types.map((t) => t.id);

    // 2) SUM(ps.amount) agrupado por type.id
    const qb = this.pSpendRepo
      .createQueryBuilder('ps')
      .innerJoin('ps.subType', 'st')
      .innerJoin('st.type', 't')
      .select('t.id', 'typeId')
      .addSelect('COALESCE(SUM(ps.amount),0)', 'total')
      .where('t.id IN (:...typeIds)', { typeIds });

    if (fiscalYearId) {
      qb.innerJoin('ps.fiscalYear', 'fy').andWhere('fy.id = :fy', { fy: fiscalYearId });
    }
    if (departmentId) {
      qb.innerJoin('t.department', 'd').andWhere('d.id = :dep', { dep: departmentId });
    }

    qb.groupBy('t.id');

    const rows: Array<{ typeId: string; total: string }> = await qb.getRawMany();
    const totals = new Map<number, number>();
    for (const r of rows) totals.set(Number(r.typeId), Number(r.total));

    // 3) Inyectar amountPSpend en cada tipo
    for (const t of types) {
      (t as any).amountPSpend = (totals.get(t.id) ?? 0).toFixed(2);
      (t as any).byDepartment = null;
    }

    return types;
  }

  /**
   * Crea un nuevo tipo de gasto proyectado ligado a un departamento
   */
  async create(dto: { name: string; departmentId: number }) {
    const dep = await this.depRepo.findOneBy({ id: dto.departmentId });
    if (!dep) throw new NotFoundException('Department no existe');

    const row = this.typeRepo.create({ name: dto.name, department: dep });
    return this.typeRepo.save(row);
  }
}
