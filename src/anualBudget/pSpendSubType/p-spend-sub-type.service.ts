import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { PSpendSubType } from './entities/p-spend-sub-type.entity';
import { PSpend } from '../pSpend/entities/p-spend.entity';

@Injectable()
export class PSpendSubTypeService {
  constructor(
    @InjectRepository(PSpendSubType)
    private readonly subTypeRepo: Repository<PSpendSubType>,
    @InjectRepository(PSpend)
    private readonly pSpendRepo: Repository<PSpend>,
  ) {}

  /**
   * Lista subtipos y agrega amountPSpend = SUM(ps.amount) por subTipo.
   *
   * Filtros:
   * - departmentId: limita los subtipos a los de ese departamento (vía su type.department)
   * - typeId: limita a un tipo específico
   * - fiscalYearId: limita la SUMA al año fiscal indicado
   */
  async findAll(
    departmentId?: number,
    typeId?: number,
    fiscalYearId?: number,
  ) {
    // 1) Traer los subtipos con su type (filtrando por departmentId y/o typeId)
    const where: any = {};
    if (typeId) where.type = { id: typeId } as any;
    if (departmentId) {
      where.type = {
        ...(where.type || {}),
        department: { id: departmentId } as any,
      };
    }

    const subtypes = await this.subTypeRepo.find({
      where,
      relations: ['type'],
      order: { id: 'ASC' },
    });

    if (subtypes.length === 0) return [];

    // 2) Sumar PSpend por subTipo
    const subTypeIds = subtypes.map((s) => s.id);

    const qb = this.pSpendRepo
      .createQueryBuilder('ps')
      .select('ps.subTypeId', 'subTypeId')
      .addSelect('COALESCE(SUM(ps.amount), 0)', 'total')
      .where('ps.subTypeId IN (:...ids)', { ids: subTypeIds });

    if (fiscalYearId) {
      qb.andWhere('ps.fiscalYearId = :fy', { fy: fiscalYearId });
    }

    const rows = await qb.groupBy('ps.subTypeId').getRawMany<{
      subTypeId: number;
      total: string | number;
    }>();

    // 3) Mapear SUM a cada subtipo
    const totals = new Map<number, number>();
    for (const r of rows) {
      const n = typeof r.total === 'string' ? Number(r.total) : (r.total ?? 0);
      totals.set(Number(r.subTypeId), Number.isFinite(n) ? n : 0);
    }

    return subtypes.map((s) => ({
      id: s.id,
      name: s.name,
      // suma formateada como string con 2 decimales para consistencia
      amountPSpend: (totals.get(s.id) ?? 0).toFixed(2),
      type: s.type
        ? {
            id: s.type.id,
            name: s.type.name,
          }
        : null,
    }));
  }

  // --- CRUD mínimos (si ya los tienes, deja los tuyos) ---

  async create(dto: { name: string; typeId: number }) {
    const entity = this.subTypeRepo.create({
      name: dto.name,
      type: { id: dto.typeId } as any,
    });
    return this.subTypeRepo.save(entity);
  }

  async update(id: number, dto: { name?: string; typeId?: number }) {
    const partial: any = {};
    if (dto.name !== undefined) partial.name = dto.name;
    if (dto.typeId !== undefined) partial.type = { id: dto.typeId } as any;
    await this.subTypeRepo.update(id, partial);
    return this.subTypeRepo.findOne({
      where: { id },
      relations: ['type'],
    });
  }

  async remove(id: number) {
    await this.subTypeRepo.delete(id);
    return { ok: true };
  }
}
