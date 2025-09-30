import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Income } from './entities/income.entity';
import { CreateIncomeDto } from './dto/createIncomeDto';
import { UpdateIncomeDto } from './dto/updateIncomeDto';
import { IncomeSubType } from '../incomeSubType/entities/income-sub-type.entity';
import { IncomeTypeService } from '../incomeType/income-type.service';
import { FiscalYearService } from '../fiscalYear/fiscal-year.service';
import { IncomeSubTypeService } from '../incomeSubType/income-sub-type.service';

@Injectable()
export class IncomeService {
  constructor(
    @InjectRepository(Income) private readonly repo: Repository<Income>,
    @InjectRepository(IncomeSubType) private readonly subRepo: Repository<IncomeSubType>,
    private readonly typeService: IncomeTypeService,
    private readonly fyService: FiscalYearService,
    private readonly subTypeService: IncomeSubTypeService,
  ) {}

  private async getSubType(id: number) {
    const s = await this.subRepo.findOne({ where: { id }, relations: ['incomeType'] });
    if (!s) throw new BadRequestException('IncomeSubType not found');
    return s;
  }

  async create(dto: CreateIncomeDto) {
    await this.fyService.assertOpenByDate(dto.date);
    const s = await this.getSubType(dto.incomeSubTypeId);
    const fy = await this.fyService.resolveByDateOrActive(dto.date);

    const entity = this.repo.create({
      incomeSubType: { id: s.id } as any,
      amount: dto.amount,
      date: dto.date,
      fiscalYear: fy ?? undefined,
    });
    const saved = await this.repo.save(entity);

    // Recalcular SubType y luego el Type
    await this.subTypeService.recalcAmount(s.id);
    await this.typeService.recalcAmount(s.incomeType.id);

    return saved;
  }

  findAll(incomeSubTypeId?: number) {
    const where = incomeSubTypeId ? { incomeSubType: { id: incomeSubTypeId } } : {};
    return this.repo.find({
      where: where as any,
      relations: ['incomeSubType'],
      order: { date: 'DESC', id: 'DESC' },
    });
  }

  async findOne(id: number) {
    const row = await this.repo.findOne({
      where: { id },
      relations: ['incomeSubType', 'incomeSubType.incomeType'],
    });
    if (!row) throw new NotFoundException('Income not found');
    return row;
  }

  async update(id: number, dto: UpdateIncomeDto) {
    const row = await this.findOne(id);

    const oldSubTypeId = row.incomeSubType.id;
    const oldTypeId = row.incomeSubType.incomeType.id;

    const newDate = dto.date ?? row.date;
    await this.fyService.assertOpenByDate(newDate);

    // Posible cambio de SubType
    if (dto.incomeSubTypeId !== undefined) {
      const newSub = await this.getSubType(dto.incomeSubTypeId);
      row.incomeSubType = { id: newSub.id } as any;
    }

    if (dto.amount !== undefined) row.amount = dto.amount;
    if (dto.date !== undefined) row.date = dto.date;

    row.fiscalYear = (await this.fyService.resolveByDateOrActive(row.date)) ?? undefined;

    const saved = await this.repo.save(row);

    // Recalcular: viejo SubType/Type
    await this.subTypeService.recalcAmount(oldSubTypeId);
    await this.typeService.recalcAmount(oldTypeId);

    // Recalcular: nuevo SubType/Type si cambió
    const newSubFinal = await this.getSubType(row.incomeSubType.id);
    const newSubTypeId = newSubFinal.id;
    const newTypeId = newSubFinal.incomeType.id;

    if (newSubTypeId !== oldSubTypeId) {
      await this.subTypeService.recalcAmount(newSubTypeId);
    }
    if (newTypeId !== oldTypeId) {
      await this.typeService.recalcAmount(newTypeId);
    }

    return saved;
  }

  async remove(id: number) {
    const row = await this.findOne(id);
    await this.fyService.assertOpenByDate(row.date);

    const subTypeId = row.incomeSubType.id;
    const typeId = row.incomeSubType.incomeType.id;

    await this.repo.delete(id);

    // Recalcular acumulados tras la eliminación
    await this.subTypeService.recalcAmount(subTypeId);
    await this.typeService.recalcAmount(typeId);

    return { deleted: true };
  }
}
