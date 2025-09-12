import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SpendType } from './entities/spend-type.entity'; // ajusta a 'spent-type.entity' si así lo tienes
import { CreateSpendTypeDto } from './dto/createSpendTypeDto';
import { UpdateSpendTypeDto } from './dto/updateSpendTypeDto';
import { SpendSubType } from '../spendSubType/entities/spend-sub-type.entity';

@Injectable()
export class SpendTypeService {
  constructor(
    @InjectRepository(SpendType) private readonly typeRepo: Repository<SpendType>,
    @InjectRepository(SpendSubType) private readonly subRepo: Repository<SpendSubType>,
  ) {}

  create(dto: CreateSpendTypeDto) {
    const type = this.typeRepo.create({ name: dto.name }); // amountSpend NO se setea por API
    return this.typeRepo.save(type);
  }

  findAll() {
    return this.typeRepo.find({
      relations: ['spendSubTypes'], // pedir solo relaciones que existen
    });
  }

  findOne(id: number) {
    return this.typeRepo.findOne({
      where: { id_SpendType: id },
      relations: ['spendSubTypes'],
    });
  }

  // Evitar que sobreescriban amountSpend por API
  async update(id: number, dto: UpdateSpendTypeDto) {
    await this.typeRepo.update(id, { name: dto.name });
    // opcional: recalcular por si cambias nombre? no afecta el total
    return this.findOne(id);
  }

  remove(id: number) {
    return this.typeRepo.delete(id);
  }

  /** Recalcula y guarda la suma de TODOS los SpendSubType de un SpendType */
  async recalcAmount(spendTypeId: number) {
    const row = await this.subRepo
      .createQueryBuilder('s')
      .select('COALESCE(SUM(s.amount), 0)', 'total')
      .where('s.id_SpendType = :id', { id: spendTypeId }) // usar la FK real
      .getRawOne<{ total: string | number }>();

    const total = Number(row?.total ?? 0);
    await this.typeRepo.update(spendTypeId, { amountSpend: total });
    return this.findOne(spendTypeId);
  }
}
