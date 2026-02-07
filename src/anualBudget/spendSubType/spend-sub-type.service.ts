import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { SpendSubType } from './entities/spend-sub-type.entity';
import { CreateSpendSubTypeDto } from './dto/createSpendSubTypeDto';
import { UpdateSpendSubTypeDto } from './dto/updateSpendSubTypeDto';
import { SpendType } from '../spendType/entities/spend-type.entity';
import { SpendTypeService } from '../spendType/spend-type.service';
import { Spend } from '../spend/entities/spend.entity';
import { PSpendSubType } from 'src/anualBudget/pSpendSubType/entities/p-spend-sub-type.entity';

@Injectable()
export class SpendSubTypeService {
  constructor(
    @InjectRepository(SpendSubType) private readonly repo: Repository<SpendSubType>,
    @InjectRepository(SpendType)    private readonly typeRepo: Repository<SpendType>,
    @InjectRepository(Spend)        private readonly spendRepo: Repository<Spend>,
    private readonly typeService: SpendTypeService,
    @InjectRepository(PSpendSubType) private readonly pSubRepo: Repository<PSpendSubType>,
  ) {}

  private normalizeName(name: string) {
    return (name ?? '').trim().replace(/\s+/g, ' ');
  }

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
 async ensureFromProjection(pSpendSubTypeId: number) {
    const pSub = await this.pSubRepo.findOne({
      where: { id: pSpendSubTypeId },
      relations: ['type', 'type.department'],
    });

    if (!pSub) throw new NotFoundException('PSpendSubType not found');

    const name = this.normalizeName(pSub.name);
    const pTypeId = pSub.type?.id;

    if (!name) throw new BadRequestException('Projection subType name is empty');
    if (!pTypeId) throw new BadRequestException('Projection subType has no type');

    // 1) asegurar type real (igual que Income)
    const realType = await this.typeService.ensureFromProjection(pTypeId);

    // 2) buscar SubType real por (type + LOWER(name))
    const existing = await this.repo
      .createQueryBuilder('s')
      .innerJoin('s.spendType', 't')
      .where('t.id = :typeId', { typeId: realType.id })
      .andWhere('LOWER(s.name) = LOWER(:name)', { name })
      .getOne();

    if (existing) return existing;

    // 3) crear si no existe
    const created = this.repo.create({
      name,
      spendType: { id: realType.id } as any,
    });

    return this.repo.save(created);
  }
}
