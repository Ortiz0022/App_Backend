import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { SpendSubType } from './entities/spend-sub-type.entity';
import { CreateSpendSubTypeDto } from './dto/createSpendSubTypeDto';
import { UpdateSpendSubTypeDto } from './dto/updateSpendSubTypeDto';
import { SpendType } from '../spendType/entities/spend-type.entity';
import { SpendTypeService } from '../spendType/spend-type.service';
import { Spend } from '../spend/entities/spend.entity';

@Injectable()
export class SpendSubTypeService {
  constructor(
    @InjectRepository(SpendSubType) private readonly repo: Repository<SpendSubType>,
    @InjectRepository(SpendType)    private readonly typeRepo: Repository<SpendType>,
    @InjectRepository(Spend)        private readonly spendRepo: Repository<Spend>, // NUEVO
    private readonly typeService: SpendTypeService,
  ) {}

  private async getType(id: number) {
    const t = await this.typeRepo.findOne({ where: { id } });
    if (!t) throw new BadRequestException('SpendType not found');
    return t;
  }

  /** NUEVO: recalcula el subtotal del SubType y luego el total del Type */
  async recalcAmountSubSpend(subTypeId: number) {
  const sub = await this.repo.findOne({ where: { id: subTypeId }, relations: ['spendType'] });
  if (!sub) throw new NotFoundException('SpendSubType not found');

  const totalRaw = await this.spendRepo
    .createQueryBuilder('sp')
    .where('sp.spendSubTypeId = :id', { id: subTypeId }) // ajusta si tu FK tiene otro nombre
    .select('COALESCE(SUM(sp.amount), 0)', 'total')
    .getRawOne<{ total: string }>(); // <- puede ser undefined

  const total = totalRaw?.total ?? '0'; // <- manejamos undefined
  sub.amountSubSpend = total;
  await this.repo.save(sub);

  await this.typeService.recalcAmount(sub.spendType.id);
  return sub.amountSubSpend;
}

/** ✅ NUEVO: Recalcula con EL MISMO EntityManager/tx para evitar locks */
async recalcAmountSubSpendWithManager(em: EntityManager, subTypeId: number) {
  const sub = await em.findOne(SpendSubType, { where: { id: subTypeId }, relations: ['spendType'] });
  if (!sub) throw new NotFoundException('SpendSubType not found');

  const totalRaw = await em
    .createQueryBuilder(Spend, 'sp')
    .where('sp.spendSubType = :id', { id: subTypeId })
    .select('COALESCE(SUM(sp.amount), 0)', 'total')
    .getRawOne<{ total: string }>();

  const total = Number(totalRaw?.total ?? 0).toFixed(2);
  await em.update(SpendSubType, subTypeId, { amountSubSpend: total });

  // Recalcula el tipo con el mismo em
  await this.recalcSpendTypeAmountWithManager(em, sub.spendType.id);
  return total;
}

 /** ✅ NUEVO: Suma de amountSubSpend por tipo usando el mismo em */
 async recalcSpendTypeAmountWithManager(em: EntityManager, spendTypeId: number) {
  const totalRaw = await em
    .createQueryBuilder(SpendSubType, 's')
    .where('s.spendType = :id', { id: spendTypeId })
    .select('COALESCE(SUM(s.amountSubSpend), 0)', 'total')
    .getRawOne<{ total: string }>();

  const total = Number(totalRaw?.total ?? 0).toFixed(2);
  await em.update(SpendType, spendTypeId, { amountSpend: total });
  return total;
}


  async create(dto: CreateSpendSubTypeDto) {
    await this.getType(dto.spendTypeId);
    const entity = this.repo.create({
      name: dto.name,
      spendType: { id: dto.spendTypeId } as any,
      // amountSubSpend se queda en 0 por default
    });
    return this.repo.save(entity);
  }

  findAll(spendTypeId?: number) {
    const where = spendTypeId ? { spendType: { id: spendTypeId } } : {};
    return this.repo.find({ where: where as any, relations: ['spendType'], order: { id: 'DESC' } });
  }

  async findOne(id: number) {
    const row = await this.repo.findOne({ where: { id }, relations: ['spendType'] });
    if (!row) throw new NotFoundException('SpendSubType not found');
    return row;
  }

  async update(id: number, dto: UpdateSpendSubTypeDto) {
    const row = await this.findOne(id);
    const oldTypeId = row.spendType.id;

    if (dto.name !== undefined) row.name = dto.name;
    if (dto.spendTypeId !== undefined) {
      await this.getType(dto.spendTypeId);
      row.spendType = { id: dto.spendTypeId } as any;
    }

    const saved = await this.repo.save(row);

    // Si cambió de tipo, recalcular totales del tipo viejo y nuevo
    if (dto.spendTypeId !== undefined && dto.spendTypeId !== oldTypeId) {
      await this.typeService.recalcAmount(oldTypeId);
      await this.typeService.recalcAmount(dto.spendTypeId);
    } else {
      // Si no cambió de tipo, el subtotal de este SubType podría haber cambiado por otros procesos
      // (no lo tocamos aquí porque no alteramos Spends en esta operación).
    }

    return saved;
  }

  async remove(id: number) {
    const row = await this.findOne(id);
    const typeId = row.spendType.id;

    await this.repo.delete(id);

    // Al eliminar un SubType, recalcula el total del Type
    await this.typeService.recalcAmount(typeId);

    return { deleted: true };
  }
}
