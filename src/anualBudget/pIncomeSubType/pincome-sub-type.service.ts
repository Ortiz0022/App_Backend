import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PIncomeTypeService } from '../pIncomeType/pincome-type.service';
import { CreatePIncomeSubTypeDto } from './dto/createPIncomeSubTypeDto';
import { UpdatePIncomeSubTypeDto } from './dto/updatePIncomeSubTypeDto';
import { PIncomeSubType } from './entities/pincome-sub-type.entity';
import { PIncomeType } from '../pIncomeType/entities/pincome-type.entity';
import { PIncome } from '../pIncome/entities/pIncome.entity';

@Injectable()
export class PIncomeSubTypeService {
  constructor(
    @InjectRepository(PIncomeSubType) private readonly repo: Repository<PIncomeSubType>,
    @InjectRepository(PIncomeType) private readonly typeRepo: Repository<PIncomeType>,
    @InjectRepository(PIncome) private readonly pIncRepo: Repository<PIncome>,
    private readonly typeService: PIncomeTypeService,
  ) {}

  private async getType(id: number) {
    const t = await this.typeRepo.findOne({ where: { id } });
    if (!t) throw new BadRequestException('PIncomeType not found');
    return t;
  }

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

  private async assertNoDuplicateName(name: string, pIncomeTypeId: number, ignoreId?: number) {
    const key = this.normalizeKey(name);

    const rows = await this.repo.find({
      where: { pIncomeType: { id: pIncomeTypeId } } as any,
      select: { id: true, name: true } as any,
    });

    const dup = rows.find((r) => (ignoreId ? r.id !== ignoreId : true) && this.normalizeKey(r.name) === key);
    if (dup) throw new BadRequestException('Ya existe un subtipo con ese nombre.');
  }

  async create(dto: CreatePIncomeSubTypeDto) {
    await this.getType(dto.pIncomeTypeId);

    const cleanName = this.normalizeName(dto.name);
    await this.assertNoDuplicateName(cleanName, dto.pIncomeTypeId);

    const entity = this.repo.create({
      name: cleanName,
      pIncomeType: { id: dto.pIncomeTypeId } as any,
    });
    return this.repo.save(entity);
  }

  async findAll(pIncomeTypeId?: number, fiscalYearId?: number) {
    const where = pIncomeTypeId ? { pIncomeType: { id: pIncomeTypeId } } : {};

    const rows = await this.repo.find({
      where: where as any,
      relations: ['pIncomeType'],
      order: { id: 'DESC' },
    });

    if (!fiscalYearId) return rows;

    const totals = await this.pIncRepo
      .createQueryBuilder('i')
      .innerJoin('i.fiscalYear', 'fy')
      .innerJoin('i.pIncomeSubType', 's')
      .select('s.id', 'subTypeId')
      .addSelect('COALESCE(SUM(i.amount), 0)', 'total')
      .where('fy.id = :fiscalYearId', { fiscalYearId })
      .groupBy('s.id')
      .getRawMany<{ subTypeId: string; total: string }>();

    const totalsMap = new Map<number, string>();
    for (const row of totals) {
      totalsMap.set(Number(row.subTypeId), Number(row.total ?? 0).toFixed(2));
    }

    return rows.map((row: any) => ({
      ...row,
      amountSubPIncome: totalsMap.get(row.id) ?? '0.00',
    }));
  }

  async findOne(id: number, fiscalYearId?: number) {
  const row = await this.repo.findOne({ where: { id }, relations: ['pIncomeType'] });
  if (!row) throw new NotFoundException('PIncomeSubType not found');

  if (!fiscalYearId) return row;

  const totalRaw = await this.pIncRepo
    .createQueryBuilder('i')
    .innerJoin('i.fiscalYear', 'fy')
    .innerJoin('i.pIncomeSubType', 's')
    .where('s.id = :id', { id })
    .andWhere('fy.id = :fiscalYearId', { fiscalYearId })
    .select('COALESCE(SUM(i.amount), 0)', 'total')
    .getRawOne<{ total: string }>();

  return {
    ...row,
    amountSubPIncome: Number(totalRaw?.total ?? 0).toFixed(2),
  };
}

  async update(id: number, dto: UpdatePIncomeSubTypeDto) {
    const row = await this.findOne(id);
    const oldTypeId = row.pIncomeType.id;

    const nextTypeId = dto.pIncomeTypeId !== undefined ? dto.pIncomeTypeId : oldTypeId;

    if (dto.name !== undefined) {
      const cleanName = this.normalizeName(dto.name);
      await this.assertNoDuplicateName(cleanName, nextTypeId, id);
      row.name = cleanName;
    }

    if (dto.pIncomeTypeId !== undefined && dto.pIncomeTypeId !== oldTypeId) {
      row.pIncomeType = await this.getType(dto.pIncomeTypeId);
    }

    const saved = await this.repo.save(row);

    if (dto.pIncomeTypeId !== undefined && dto.pIncomeTypeId !== oldTypeId) {
      await this.typeService.recalcAmount(oldTypeId);
      await this.typeService.recalcAmount(dto.pIncomeTypeId);
    }
    return saved;
  }

  async remove(id: number) {
    const row = await this.repo.findOne({
      where: { id },
      relations: ['pIncomeType', 'pIncomes'],
    });
    if (!row) throw new NotFoundException('PIncomeSubType not found');

    if (row.pIncomes?.length) {
      throw new BadRequestException('No se puede eliminar el subtipo porque tiene proyecciones registradas.');
    }

    const typeId = row.pIncomeType.id;
    await this.repo.delete(id);
    await this.typeService.recalcAmount(typeId);

    return { deleted: true };
  }
}