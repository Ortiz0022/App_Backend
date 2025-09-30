import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Spend } from './entities/spend.entity';
import { CreateSpendDto } from './dto/createSpendDto';
import { UpdateSpendDto } from './dto/updateSpendDto';
import { SpendSubType } from '../spendSubType/entities/spend-sub-type.entity';
import { SpendTypeService } from '../spendType/spend-type.service';
import { FiscalYearService } from '../fiscalYear/fiscal-year.service';
import { SpendSubTypeService } from '../spendSubType/spend-sub-type.service'; // NUEVO

@Injectable()
export class SpendService {
  constructor(
    @InjectRepository(Spend) private readonly repo: Repository<Spend>,
    @InjectRepository(SpendSubType) private readonly subRepo: Repository<SpendSubType>,
    private readonly typeService: SpendTypeService,
    private readonly fyService: FiscalYearService,
    private readonly subTypeService: SpendSubTypeService, // NUEVO
  ) {}

  private async getSubType(id: number) {
    const s = await this.subRepo.findOne({ where: { id }, relations: ['spendType'] });
    if (!s) throw new BadRequestException('SpendSubType not found');
    return s;
  }

  async create(dto: CreateSpendDto) {
    // validar año fiscal abierto para la fecha del movimiento
    await this.fyService.assertOpenByDate(dto.date);
    const s = await this.getSubType(dto.spendSubTypeId);
    const fy = await this.fyService.resolveByDateOrActive(dto.date);

    const entity = this.repo.create({
      spendSubType: { id: s.id } as any,
      amount: dto.amount,
      date: dto.date,
      fiscalYear: fy ?? undefined,
    });
    const saved = await this.repo.save(entity);

    // Recalcular subtotal del SubType y total del Type
    await this.subTypeService.recalcAmountSubSpend(s.id);
    await this.typeService.recalcAmount(s.spendType.id);

    return saved;
  }

  findAll(spendSubTypeId?: number) {
    const where = spendSubTypeId ? { spendSubType: { id: spendSubTypeId } } : {};
    return this.repo.find({
      where: where as any,
      relations: ['spendSubType'],
      order: { date: 'DESC', id: 'DESC' },
    });
  }

  async findOne(id: number) {
    const row = await this.repo.findOne({
      where: { id },
      relations: ['spendSubType', 'spendSubType.spendType'],
    });
    if (!row) throw new NotFoundException('Spend not found');
    return row;
  }

  async update(id: number, dto: UpdateSpendDto) {
    const row = await this.findOne(id);

    const oldSubTypeId = row.spendSubType.id;
    const oldTypeId = row.spendSubType.spendType.id;

    const newDate = dto.date ?? row.date;
    await this.fyService.assertOpenByDate(newDate);

    if (dto.spendSubTypeId !== undefined) {
      const s = await this.getSubType(dto.spendSubTypeId);
      row.spendSubType = { id: s.id } as any;
    }
    if (dto.amount !== undefined) row.amount = dto.amount;
    if (dto.date !== undefined) row.date = dto.date;

    row.fiscalYear = (await this.fyService.resolveByDateOrActive(row.date)) ?? undefined;

    const saved = await this.repo.save(row);

    // Recalcular: subtipo viejo (si cambió o igual, sigue correcto) y subtipo nuevo
    await this.subTypeService.recalcAmountSubSpend(oldSubTypeId);
    const newSubTypeId = row.spendSubType.id;
    if (newSubTypeId !== oldSubTypeId) {
      await this.subTypeService.recalcAmountSubSpend(newSubTypeId);
    }

    // Recalcular tipo viejo y (si cambió) tipo nuevo
    await this.typeService.recalcAmount(oldTypeId);
    const newTypeId = (await this.getSubType(newSubTypeId)).spendType.id;
    if (newTypeId !== oldTypeId) {
      await this.typeService.recalcAmount(newTypeId);
    }

    return saved;
  }

  async remove(id: number) {
    const row = await this.findOne(id);
    await this.fyService.assertOpenByDate(row.date);

    const subTypeId = row.spendSubType.id;
    const typeId = row.spendSubType.spendType.id;

    await this.repo.delete(id);

    // Recalcular subtotal y total
    await this.subTypeService.recalcAmountSubSpend(subTypeId);
    await this.typeService.recalcAmount(typeId);

    return { deleted: true };
  }
}
