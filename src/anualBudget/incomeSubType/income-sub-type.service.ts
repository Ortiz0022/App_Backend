// src/anualBudget/incomeSubType/income-sub-type.service.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IncomeSubType } from './entities/income-sub-type.entity';
import { CreateIncomeSubTypeDto } from './dto/createIncomeSubTypeDto';
import { UpdateIncomeSubTypeDto } from './dto/updateIncomeSubTypeDto';
import { IncomeType } from '../incomeType/entities/income-type.entity';
import { IncomeTypeService } from '../incomeType/income-type.service';

@Injectable()
export class IncomeSubTypeService {
  constructor(
    @InjectRepository(IncomeSubType) private readonly repo: Repository<IncomeSubType>,
    @InjectRepository(IncomeType) private readonly typeRepo: Repository<IncomeType>,
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
    return this.repo.find({ where: where as any, relations: ['incomeType'], order: { id: 'DESC' } });
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

    // si cambió de tipo, recalcula el viejo y el nuevo (sumas basadas en income)
    if (dto.incomeTypeId !== undefined && dto.incomeTypeId !== oldTypeId) {
      await this.typeService.recalcAmount(oldTypeId);
      await this.typeService.recalcAmount(dto.incomeTypeId);
    }
    return saved;
  }

  async remove(id: number) {
    const row = await this.findOne(id);
    await this.repo.delete(id);
    // si borras un subtipo, las sumas por tipo no cambian hasta que borres/reescribas sus incomes
    return { deleted: true };
  }
}
