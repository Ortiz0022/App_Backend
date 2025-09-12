import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SpendSubType } from './entities/spend-sub-type.entity';
import { SpendType } from '../spendType/entities/spend-type.entity'; // ajusta si tu archivo se llama 'spent-type.entity'
import { SpendTypeService } from '../spendType/spend-type.service';

import { CreateSpendSubTypeDto } from './dto/createSpendSubTypeDto';
import { UpdateSpendSubTypeDto } from './dto/updateSpendSubTypeDto';

@Injectable()
export class SpendSubTypeService {
  constructor(
    @InjectRepository(SpendSubType) private readonly subRepo: Repository<SpendSubType>,
    @InjectRepository(SpendType) private readonly typeRepo: Repository<SpendType>,
    private readonly spendTypeService: SpendTypeService, // para disparar el recálculo
  ) {}

  // CREATE: recalc DESPUÉS del commit de la transacción
  async create(dto: CreateSpendSubTypeDto) {
    const saved = await this.subRepo.manager.transaction(async (trx) => {
      const typeRepo = trx.getRepository(SpendType);
      const subRepo = trx.getRepository(SpendSubType);

      const type = await typeRepo.findOne({ where: { id_SpendType: dto.id_SpendType } });
      if (!type) throw new Error('SpendType not found');

      const sub = subRepo.create({
        name: dto.name,
        amount: dto.amount,
        date: new Date(dto.date),
        spendType: type,
      });
      return subRepo.save(sub);
    });

    await this.spendTypeService.recalcAmount(saved.spendType.id_SpendType);
    return saved;
  }

  findAll() {
    return this.subRepo.find({ relations: ['spendType'] });
  }

  findOne(id: number) {
    return this.subRepo.findOne({
      where: { id_SpendSubType: id },
      relations: ['spendType'],
    });
  }

  // UPDATE: si cambia de tipo, recalcular ambos; si no, solo el mismo
  async update(id: number, dto: UpdateSpendSubTypeDto) {
    const result = await this.subRepo.manager.transaction(async (trx) => {
      const typeRepo = trx.getRepository(SpendType);
      const subRepo = trx.getRepository(SpendSubType);

      const before = await subRepo.findOne({ where: { id_SpendSubType: id }, relations: ['spendType'] });
      if (!before) throw new Error('SpendSubType not found');

      const oldTypeId = before.spendType.id_SpendType;

      if (dto.id_SpendType && dto.id_SpendType !== oldTypeId) {
        const newType = await typeRepo.findOne({ where: { id_SpendType: dto.id_SpendType } });
        if (!newType) throw new Error('New SpendType not found');
        before.spendType = newType;
      }
      if (dto.name !== undefined) before.name = dto.name;
      if (dto.amount !== undefined) before.amount = dto.amount;
      if (dto.date !== undefined) before.date = new Date(dto.date);

      const saved = await subRepo.save(before);
      return { saved, oldTypeId };
    });

    await this.spendTypeService.recalcAmount(result.oldTypeId);
    const newTypeId = result.saved.spendType.id_SpendType;
    if (newTypeId !== result.oldTypeId) {
      await this.spendTypeService.recalcAmount(newTypeId);
    }
    return result.saved;
  }

  // DELETE: borrar y luego recalc
  async remove(id: number) {
    const { typeId, affected } = await this.subRepo.manager.transaction(async (trx) => {
      const subRepo = trx.getRepository(SpendSubType);
      const sub = await subRepo.findOne({ where: { id_SpendSubType: id }, relations: ['spendType'] });
      if (!sub) return { typeId: null, affected: 0 };

      const tid = sub.spendType.id_SpendType;
      await subRepo.delete(id);
      return { typeId: tid, affected: 1 };
    });

    if (typeId) await this.spendTypeService.recalcAmount(typeId);
    return { affected };
  }
}
