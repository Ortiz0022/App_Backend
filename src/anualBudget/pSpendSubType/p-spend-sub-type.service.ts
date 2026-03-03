import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PSpendSubType } from './entities/p-spend-sub-type.entity';
import { PSpend } from '../pSpend/entities/p-spend.entity';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class PSpendSubTypeService {
  constructor(
    @InjectRepository(PSpendSubType)
    private readonly subTypeRepo: Repository<PSpendSubType>,
    @InjectRepository(PSpend)
    private readonly pSpendRepo: Repository<PSpend>,
  ) {}

  private normalizeKey(input: string) {
    return input
      .trim()
      .replace(/\s+/g, ' ')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }

  private normalizeName(name: string) {
    return name.trim().replace(/\s+/g, ' ');
  }

  private async assertNoDuplicateName(name: string, typeId: number, ignoreId?: number) {
    const key = this.normalizeKey(name);

    const rows = await this.subTypeRepo.find({
      where: { type: { id: typeId } } as any,
      select: { id: true, name: true } as any,
    });

    const dup = rows.find((r) => (ignoreId ? r.id !== ignoreId : true) && this.normalizeKey(r.name) === key);
    if (dup) throw new BadRequestException('Ya existe un subtipo con ese nombre.');
  }

  async findAll(departmentId?: number, typeId?: number, fiscalYearId?: number) {
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

    const totals = new Map<number, number>();
    for (const r of rows) {
      const n = typeof r.total === 'string' ? Number(r.total) : (r.total ?? 0);
      totals.set(Number(r.subTypeId), Number.isFinite(n) ? n : 0);
    }

    return subtypes.map((s) => ({
      id: s.id,
      name: s.name,
      amountPSpend: (totals.get(s.id) ?? 0).toFixed(2),
      type: s.type
        ? {
            id: s.type.id,
            name: s.type.name,
          }
        : null,
    }));
  }

  async create(dto: { name: string; typeId: number }) {
    const cleanName = this.normalizeName(dto.name);
    await this.assertNoDuplicateName(cleanName, dto.typeId);

    const entity = this.subTypeRepo.create({
      name: cleanName,
      type: { id: dto.typeId } as any,
    });
    return this.subTypeRepo.save(entity);
  }

  async remove(id: number) {
    const row = await this.subTypeRepo.findOne({
      where: { id },
      relations: ['type', 'pSpends'],
    });

    if (!row) throw new NotFoundException('PSpendSubType not found');

    if (row.pSpends?.length) {
      throw new BadRequestException(
        'No se puede eliminar el subtipo porque tiene proyecciones registradas.',
      );
    }

    await this.subTypeRepo.delete(id);
    return { ok: true };
  }

  async update(id: number, dto: { name?: string; typeId?: number }) {
    const row = await this.subTypeRepo.findOne({
      where: { id },
      relations: ['type'],
    });

    if (!row) throw new NotFoundException('PSpendSubType not found');

    const nextTypeId = dto.typeId !== undefined ? dto.typeId : row.type.id;

    if (dto.name !== undefined) {
      const cleanName = this.normalizeName(dto.name);
      await this.assertNoDuplicateName(cleanName, nextTypeId, id);
      row.name = cleanName;
    }

    if (dto.typeId !== undefined && dto.typeId !== row.type.id) {
      row.type = { id: dto.typeId } as any;
    }

    return this.subTypeRepo.save(row);
  }
}