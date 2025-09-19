// src/anualBudget/pSpendSubType/p-spend-sub-type.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { PSpendSubType } from './entities/p-spend-sub-type.entity';
import { PSpendType } from '../pSpendType/entities/p-spend-type.entity';
import { CreatePSpendSubTypeDto } from './dto/create.dto';
import { UpdatePSpendSubTypeDto } from './dto/update.dto';
import { PSpend } from '../pSpend/entities/p-spend.entity';

@Injectable()
export class PSpendSubTypeService {
  constructor(
    @InjectRepository(PSpendSubType) private repo: Repository<PSpendSubType>,
    @InjectRepository(PSpendType) private typeRepo: Repository<PSpendType>,
    @InjectRepository(PSpend) private pSpendRepo: Repository<PSpend>,
  ) {}

  async create(dto: CreatePSpendSubTypeDto) {
    const type = await this.typeRepo.findOneBy({ id: dto.typeId });
    if (!type) throw new NotFoundException('Type no existe');
    const row = this.repo.create({ name: dto.name, type });
    return this.repo.save(row);
  }

  /**
   * GET /p-spend-sub-type?typeId=&fiscalYearId=
   * Devuelve los subtipos y dentro de cada "type" inyecta amountPSpend
   * que es el SUM(ps.amount) de TODOS los PSpend de ese tipo (padre),
   * opcionalmente filtrado por fiscalYearId.
   */
  async findAll(typeId?: number, fiscalYearId?: number) {
    // 1) Traer la lista de subtipos (opcionalmente filtrados por typeId)
    const subTypes = await this.repo.find({
      where: typeId ? { type: { id: typeId } } : {},
      // las relaciones del type suelen venir eager; si no, añade relations: ['type']
    });

    if (subTypes.length === 0) return subTypes;

    // 2) Calcular el SUM por type.id usando los PSpend
    //    SELECT t.id, SUM(ps.amount)
    const qb = this.pSpendRepo
      .createQueryBuilder('ps')
      .innerJoin('ps.subType', 'st')
      .innerJoin('st.type', 't')
      .select('t.id', 'typeId')
      .addSelect('COALESCE(SUM(ps.amount),0)', 'total');

    if (typeId) qb.andWhere('t.id = :typeId', { typeId });
    if (fiscalYearId) {
      qb.innerJoin('ps.fiscalYear', 'fy').andWhere('fy.id = :fy', { fy: fiscalYearId });
    }

    qb.groupBy('t.id');

    const rows: Array<{ typeId: number; total: string }> = await qb.getRawMany();

    // 3) Armar un map { typeId -> total }
    const totalsByType = new Map<number, number>();
    for (const r of rows) totalsByType.set(Number(r.typeId), Number(r.total));

    // 4) Inyectar en cada subType.type.amountPSpend
    for (const st of subTypes) {
      const t: any = (st as any).type;
      if (t) {
        const total = totalsByType.get(t.id) ?? 0;
        t.amountPSpend = total.toFixed(2);
        // opcional: t.byDepartment = null;  // si deseas mantener la forma
      }
    }

    return subTypes;
  }

  async findOne(id: number) {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException();
    return item;
  }

  async update(id: number, dto: UpdatePSpendSubTypeDto) {
    const item = await this.findOne(id);
    if (dto.typeId) {
      const type = await this.typeRepo.findOneBy({ id: dto.typeId });
      if (!type) throw new NotFoundException('Type no existe');
      item.type = type;
    }
    if (dto.name !== undefined) item.name = dto.name;
    return this.repo.save(item);
  }

  async remove(id: number) {
    const item = await this.findOne(id);
    await this.repo.remove(item);
    return { ok: true };
  }
}
