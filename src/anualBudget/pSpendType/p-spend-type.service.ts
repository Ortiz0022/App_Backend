import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PSpendType } from './entities/p-spend-type.entity';
import { PSpend } from '../pSpend/entities/p-spend.entity';

@Injectable()
export class PSpendTypeService {
  constructor(
    @InjectRepository(PSpendType)
    private readonly typeRepo: Repository<PSpendType>,
    @InjectRepository(PSpend)
    private readonly pSpendRepo: Repository<PSpend>,
  ) {}

  /**
   * Devuelve tipos con amountPSpend = SUM(ps.amount) por typeId.
   * Filtros:
   * - departmentId: limita los tipos al departamento
   * - fiscalYearId: limita la SUMA al año fiscal
   */
  async findAll(departmentId?: number, fiscalYearId?: number) {
    // 1) Traer tipos con su departamento (sin pSpends)
    const where: any = {};
    if (departmentId) where.department = { id: departmentId } as any;

    const types = await this.typeRepo.find({
      where,
      relations: ['department'],
      order: { id: 'ASC' },
    });

    if (types.length === 0) return [];

    // 2) Sumar PSpend por typeId (vía ps.subType.typeId)
    const typeIds = types.map(t => t.id);

    const qb = this.pSpendRepo
      .createQueryBuilder('ps')
      .leftJoin('ps.subType', 'st')
      .leftJoin('st.type', 't')
      .select('t.id', 'typeId')
      .addSelect('COALESCE(SUM(ps.amount), 0)', 'total')
      .where('t.id IN (:...typeIds)', { typeIds });

    if (fiscalYearId) {
      qb.andWhere('ps.fiscalYearId = :fy', { fy: fiscalYearId });
    }

    const rows = await qb.groupBy('t.id').getRawMany<{ typeId: number; total: string | number }>();

    const totals = new Map<number, number>();
    for (const r of rows) {
      const n = typeof r.total === 'string' ? Number(r.total) : (r.total ?? 0);
      totals.set(Number(r.typeId), Number.isFinite(n) ? n : 0);
    }

    // 3) Mapear salida "limpia"
    return types.map(t => ({
      id: t.id,
      name: t.name,
      amountPSpend: (totals.get(t.id) ?? 0).toFixed(2),
      department: t.department
        ? { id: t.department.id, name: t.department.name }
        : null,
    }));
  }

    async create(dto: { name: string; departmentId: number }) {
    const entity = this.typeRepo.create({
      name: dto.name,
      department: { id: dto.departmentId } as any,
    });
    return this.typeRepo.save(entity);
  }

  async update(id: number, dto: { name?: string; departmentId?: number }) {
    const partial: any = {};
    if (dto.name !== undefined) partial.name = dto.name;
    if (dto.departmentId !== undefined) {
      partial.department = { id: dto.departmentId } as any;
    }
    await this.typeRepo.update(id, partial);
    return this.typeRepo.findOne({
      where: { id },
      relations: ['department'],
    });
  }

  async remove(id: number) {
    await this.typeRepo.delete(id);
    return { ok: true };
  }
}
