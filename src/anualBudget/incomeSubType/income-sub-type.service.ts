import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { IncomeSubType } from './entities/income-sub-type.entity';
import { CreateIncomeSubTypeDto } from './dto/createIncomeSubTypeDto';
import { UpdateIncomeSubTypeDto } from './dto/updateIncomeSubTypeDto';
import { IncomeType } from '../incomeType/entities/income-type.entity';
import { Income } from '../income/entities/income.entity';
import { IncomeTypeService } from '../incomeType/income-type.service';
import { PIncomeSubType } from 'src/anualBudget/pIncomeSubType/entities/pincome-sub-type.entity';

@Injectable()
export class IncomeSubTypeService {
  constructor(
    @InjectRepository(IncomeSubType) private readonly repo: Repository<IncomeSubType>,
    @InjectRepository(IncomeType) private readonly typeRepo: Repository<IncomeType>,
    @InjectRepository(Income) private readonly incRepo: Repository<Income>,
    @InjectRepository(PIncomeSubType) private readonly pSubRepo: Repository<PIncomeSubType>,
    private readonly typeService: IncomeTypeService,
  ) {}

  private async getType(id: number) {
    const t = await this.typeRepo.findOne({ where: { id } });
    if (!t) throw new BadRequestException('IncomeType not found');
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

  private async assertNoDuplicateName(name: string, incomeTypeId: number, ignoreId?: number) {
    const key = this.normalizeKey(name);

    const rows = await this.repo.find({
      where: { incomeType: { id: incomeTypeId } } as any,
      select: { id: true, name: true } as any,
    });

    const dup = rows.find((r) => (ignoreId ? r.id !== ignoreId : true) && this.normalizeKey(r.name) === key);
    if (dup) throw new BadRequestException('Ya existe un subtipo con ese nombre.');
  }

  async create(dto: CreateIncomeSubTypeDto) {
    await this.getType(dto.incomeTypeId);

    const cleanName = this.normalizeName(dto.name);
    await this.assertNoDuplicateName(cleanName, dto.incomeTypeId);

    const entity = this.repo.create({
      name: cleanName,
      incomeType: { id: dto.incomeTypeId } as any,
    });
    return this.repo.save(entity);
  }

  findAll(incomeTypeId?: number) {
    const where = incomeTypeId ? { incomeType: { id: incomeTypeId } } : {};
    return this.repo.find({
      where: where as any,
      relations: ['incomeType'],
      order: { id: 'DESC' },
    });
  }

  async findOne(id: number) {
    const row = await this.repo.findOne({ where: { id }, relations: ['incomeType'] });
    if (!row) throw new NotFoundException('IncomeSubType not found');
    return row;
  }

  async update(id: number, dto: UpdateIncomeSubTypeDto) {
    const row = await this.findOne(id);
    const oldTypeId = row.incomeType.id;

    const nextTypeId = dto.incomeTypeId !== undefined ? dto.incomeTypeId : oldTypeId;

    if (dto.name !== undefined) {
      const cleanName = this.normalizeName(dto.name);
      await this.assertNoDuplicateName(cleanName, nextTypeId, id);
      row.name = cleanName;
    }

    if (dto.incomeTypeId !== undefined) {
      await this.getType(dto.incomeTypeId);
      row.incomeType = { id: dto.incomeTypeId } as any;
    }

    const saved = await this.repo.save(row);

    if (dto.incomeTypeId !== undefined && dto.incomeTypeId !== oldTypeId) {
      await this.typeService.recalcAmount(oldTypeId);
      await this.typeService.recalcAmount(dto.incomeTypeId);
    }

    return saved;
  }

  async remove(id: number) {
    const row = await this.findOne(id);
    const typeId = row.incomeType.id;

    await this.repo.delete(id);
    await this.typeService.recalcAmount(typeId);

    return { deleted: true };
  }

  async recalcAmount(incomeSubTypeId: number) {
    const totalRaw = await this.incRepo
      .createQueryBuilder('i')
      .where('i.incomeSubType = :sid', { sid: incomeSubTypeId })
      .select('COALESCE(SUM(i.amount),0)', 'total')
      .getRawOne<{ total: string }>();

    const total = Number(totalRaw?.total ?? 0).toFixed(2);
    await this.repo.update(incomeSubTypeId, { amountSubIncome: total });

    const sub = await this.findOne(incomeSubTypeId);
    await this.typeService.recalcAmount(sub.incomeType.id);

    return sub;
  }

  async recalcAmountWithManager(em: EntityManager, incomeSubTypeId: number) {
    const totalRaw = await em
      .createQueryBuilder(Income, 'i')
      .where('i.incomeSubType = :sid', { sid: incomeSubTypeId })
      .select('COALESCE(SUM(i.amount),0)', 'total')
      .getRawOne<{ total: string }>();

    const total = Number(totalRaw?.total ?? 0).toFixed(2);

    await em.update(IncomeSubType, incomeSubTypeId, { amountSubIncome: total });

    const sub = await em.findOne(IncomeSubType, {
      where: { id: incomeSubTypeId },
      relations: ['incomeType'],
    });

    if (sub?.incomeType?.id) {
      const typeId = sub.incomeType.id;

      const typeTotalRaw = await em
        .createQueryBuilder(IncomeSubType, 's')
        .where('s.incomeType = :id', { id: typeId })
        .select('COALESCE(SUM(s.amountSubIncome),0)', 'total')
        .getRawOne<{ total: string }>();

      const typeTotal = Number(typeTotalRaw?.total ?? 0).toFixed(2);
      await em.update(IncomeType, typeId, { amountIncome: typeTotal });
    }

    return total;
  }

  async fromProjectionSubType(pIncomeSubTypeId: number) {
    const pSub = await this.pSubRepo.findOne({
      where: { id: pIncomeSubTypeId },
      relations: ['pIncomeType', 'pIncomeType.department'],
    });

    if (!pSub) throw new BadRequestException('PIncomeSubType not found');

    const realType = await this.typeService.fromProjectionType(pSub.pIncomeType.id);

    const name = this.normalizeName(pSub.name);
    const key = this.normalizeKey(name);

    const subs = await this.repo.find({
      where: { incomeType: { id: realType.id } } as any,
      select: { id: true, name: true } as any,
    });

    const dup = subs.find((s) => this.normalizeKey(s.name) === key);
    if (dup) return this.findOne(dup.id);

    const created = this.repo.create({
      name,
      incomeType: { id: realType.id } as any,
    });

    return this.repo.save(created);
  }
}