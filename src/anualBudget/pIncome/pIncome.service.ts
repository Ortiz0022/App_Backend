// ✅ IMPORTS: cambia IncomeTypeService -> PIncomeTypeService
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PIncome } from '../pIncome/entities/pIncome.entity';
import { PIncomeSubType } from '../pIncomeSubType/entities/pincome-sub-type.entity';
import { PIncomeTypeService } from '../pIncomeType/pincome-type.service';   // <-- nuevo

@Injectable()
export class PIncomeService {
  constructor(
    @InjectRepository(PIncome) private readonly repo: Repository<PIncome>,
    @InjectRepository(PIncomeSubType) private readonly subRepo: Repository<PIncomeSubType>,
    private readonly pIncomeTypeService: PIncomeTypeService,               // <-- nuevo
  ) {}

  // ⚠️ NO toco tu findAll. Déjalo exactamente como lo tienes.
  // findAll(...) { /* tu implementación actual */ }

  private async getSubType(id: number) {
    const s = await this.subRepo.findOne({ where: { id }, relations: ['pincomeType'] });
    if (!s) throw new BadRequestException('PIncomeSubType not found');
    return s;
  }

  async create(dto: { incomeSubTypeId: number; amount: string }) {
    const s = await this.getSubType(dto.incomeSubTypeId);

    const entity = this.repo.create({
      // propiedad correcta en tu entidad PIncome
      pIncomeSubType: { id: s.id } as any,
      amount: dto.amount,
    });
    const saved = await this.repo.save(entity);

    // ✅ Recalcula con el servicio de PROYECCIÓN
    await this.pIncomeTypeService.recalcAmount(s.pincomeType.id);
    return saved;
  }

  async findOne(id: number) {
    const row = await this.repo.findOne({
      where: { id },
      relations: ['pIncomeSubType', 'pIncomeSubType.pincomeType'],
    });
    if (!row) throw new NotFoundException('PIncome not found');
    return row;
  }

  findAll(pIncomeSubTypeId?: number) {
    const where = pIncomeSubTypeId
      ? { pIncomeSubType: { id: pIncomeSubTypeId } }
      : {};

    return this.repo.find({
      where: where as any, // si TS molesta con tipos, deja este 'as any'
      relations: [
        'pIncomeSubType',
        'pIncomeSubType.pincomeType', // relación anidada correcta
      ],
      order: { id: 'DESC' },
    });
  }

  async update(id: number, dto: { incomeSubTypeId?: number; amount?: string }) {
    const row = await this.findOne(id);
    const oldTypeId = row.pIncomeSubType.pincomeType.id;

    if (dto.incomeSubTypeId !== undefined) {
      const s = await this.getSubType(dto.incomeSubTypeId);
      row.pIncomeSubType = { id: s.id } as any;
    }
    if (dto.amount !== undefined) row.amount = dto.amount;

    const saved = await this.repo.save(row);

    const newTypeId = (await this.getSubType(row.pIncomeSubType.id)).pincomeType.id;
    await this.pIncomeTypeService.recalcAmount(oldTypeId);
    if (newTypeId !== oldTypeId) await this.pIncomeTypeService.recalcAmount(newTypeId);

    return saved;
  }

  async remove(id: number) {
    const row = await this.findOne(id);
    const typeId = row.pIncomeSubType.pincomeType.id;

    await this.repo.delete(id);
    await this.pIncomeTypeService.recalcAmount(typeId);

    return { deleted: true };
  }
}
