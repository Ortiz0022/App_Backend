import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { IncomeSubType } from './entities/income-sub-type.entity';
import { CreateIncomeSubTypeDto } from './dto/createIncomeSubTypeDto';
import { UpdateIncomeSubTypeDto } from './dto/updateIncomeSubTypeDto';
import { IncomeType } from '../incomeType/entities/income-type.entity';
import { Income } from '../income/entities/income.entity';
import { IncomeTypeService } from '../incomeType/income-type.service';

@Injectable()
export class IncomeSubTypeService {
  constructor(
    @InjectRepository(IncomeSubType) private readonly repo: Repository<IncomeSubType>,
    @InjectRepository(IncomeType) private readonly typeRepo: Repository<IncomeType>,
    @InjectRepository(Income) private readonly incRepo: Repository<Income>,
    private readonly typeService: IncomeTypeService,
  ) {}

  private async getType(id: number) {
    const t = await this.typeRepo.findOne({ where: { id } });
    if (!t) throw new BadRequestException('IncomeType not found');
    return t;
  }

  async create(dto: CreateIncomeSubTypeDto) {
    await this.getType(dto.incomeTypeId);
    const entity = this.repo.create({
      name: dto.name,
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

    if (dto.name !== undefined) row.name = dto.name;
    if (dto.incomeTypeId !== undefined) {
      await this.getType(dto.incomeTypeId);
      row.incomeType = { id: dto.incomeTypeId } as any;
    }

    const saved = await this.repo.save(row);

    // Si cambió de type, recalcular ambos types (suma desde subtypes)
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

    // Al eliminar el SubType, recalcular el total del Type (desde subtypes)
    await this.typeService.recalcAmount(typeId);

    return { deleted: true };
  }

  async recalcAmountWithManager(em: EntityManager, incomeSubTypeId: number) {
    // 1) SUM(Income.amount) del subtipo con el MISMO manager
    const totalRaw = await em
      .createQueryBuilder(Income, 'i')
      .where('i.incomeSubType = :sid', { sid: incomeSubTypeId })
      .select('COALESCE(SUM(i.amount),0)', 'total')
      .getRawOne<{ total: string }>();
  
    const total = Number(totalRaw?.total ?? 0).toFixed(2);
  
    // 2) Actualiza el materializado del SubType
    await em.update(IncomeSubType, incomeSubTypeId, { amountSubIncome: total });
  
    // 3) Recalcula el Type padre (suma de amountSubIncome)
    const sub = await em.findOne(IncomeSubType, {
      where: { id: incomeSubTypeId },
      relations: ['incomeType'],
    });
    if (sub?.incomeType?.id) {
      // si tu IncomeTypeService también tiene ...WithManager, úsalo; sino, recalca normal
      const maybeWithEm = (this.typeService as any).recalcAmountWithManager;
      if (typeof maybeWithEm === 'function') {
        await maybeWithEm.call(this.typeService, em, sub.incomeType.id);
      } else {
        await this.typeService.recalcAmount(sub.incomeType.id);
      }
    }
  
    return total;
  }

  /** Recalcula y persiste amountSubIncome = SUM(Income.amount) del SubType */
  async recalcAmount(incomeSubTypeId: number) {
    const totalRaw = await this.incRepo
      .createQueryBuilder('i')
      .where('i.incomeSubType = :sid', { sid: incomeSubTypeId })
      .select('COALESCE(SUM(i.amount),0)', 'total')
      .getRawOne<{ total: string }>();

    const total = Number(totalRaw?.total ?? 0).toFixed(2);
    await this.repo.update(incomeSubTypeId, { amountSubIncome: total });

    const sub = await this.findOne(incomeSubTypeId);
    // Al recalcular el SubType, también recalculamos su Type
    await this.typeService.recalcAmount(sub.incomeType.id);

    return sub;
  }
}
