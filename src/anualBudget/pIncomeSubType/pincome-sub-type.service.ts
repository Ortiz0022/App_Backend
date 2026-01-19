// src/anualBudget/incomeSubType/income-sub-type.service.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PIncomeTypeService } from '../pIncomeType/pincome-type.service';
import { CreatePIncomeSubTypeDto } from './dto/createPIncomeSubTypeDto';
import { UpdatePIncomeSubTypeDto } from './dto/updatePIncomeSubTypeDto';
import { PIncomeSubType } from './entities/pincome-sub-type.entity';
import { PIncomeType } from '../pIncomeType/entities/pincome-type.entity';

@Injectable()
export class PIncomeSubTypeService {
  constructor(
    @InjectRepository(PIncomeSubType) private readonly repo: Repository<PIncomeSubType>,
    @InjectRepository(PIncomeType) private readonly typeRepo: Repository<PIncomeType>,
    private readonly typeService: PIncomeTypeService,
  ) {}

  private async getType(id: number) {
    const t = await this.typeRepo.findOne({ where: { id } });
    if (!t) throw new BadRequestException('PIncomeType not found');
    return t;
  }

  async create(dto: CreatePIncomeSubTypeDto) {
    await this.getType(dto.pIncomeTypeId);
    const entity = this.repo.create({
      name: dto.name,
      pIncomeType: { id: dto.pIncomeTypeId } as any,
    });
    return this.repo.save(entity);
  }

  findAll(pIncomeTypeId?: number) {
    const where = pIncomeTypeId ? { pIncomeType: { id: pIncomeTypeId } } : {};
    return this.repo.find({ where: where as any, relations: ['pIncomeType'], order: { id: 'DESC' } });
  }

  async findOne(id: number) {
    const row = await this.repo.findOne({ where: { id }, relations: ['pIncomeType'] });
    if (!row) throw new NotFoundException('PIncomeSubType not found');
    return row;
  }

  async update(id: number, dto: UpdatePIncomeSubTypeDto) {
    const row = await this.findOne(id);
    const oldTypeId = row.pIncomeType.id;

    if (dto.name !== undefined) row.name = dto.name;
    if (dto.pIncomeTypeId !== undefined && dto.pIncomeTypeId !== oldTypeId) {
      row.pIncomeType = await this.getType(dto.pIncomeTypeId);
    }

    const saved = await this.repo.save(row);

    // si cambió de tipo, recalcula el viejo y el nuevo (sumas basadas en income)
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
    throw new BadRequestException(
      'No se puede eliminar el subtipo porque tiene proyecciones registradas.'
    );
  }

  const typeId = row.pIncomeType.id;
  await this.repo.delete(id);
  await this.typeService.recalcAmount(typeId);

  return { deleted: true };
}

}
