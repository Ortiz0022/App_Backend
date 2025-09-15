// src/anualBudget/pSpend/p-spend.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PSpend } from './entities/p-spend.entity';
import { PSpendSubType } from '../pSpendSubType/entities/p-spend-sub-type.entity';
import { FiscalYear } from '../fiscalYear/entities/fiscal-year.entity';
import { CreatePSpendDto } from './dto/create.dto';
import { UpdatePSpendDto } from './dto/update.dto';

@Injectable()
export class PSpendService {
  constructor(
    @InjectRepository(PSpend) private repo: Repository<PSpend>,
    @InjectRepository(PSpendSubType) private subRepo: Repository<PSpendSubType>,
    @InjectRepository(FiscalYear) private fyRepo: Repository<FiscalYear>,
  ) {}

  async create(dto: CreatePSpendDto) {
    const subType = await this.subRepo.findOneBy({ id: dto.subTypeId });
    const fy = await this.fyRepo.findOneBy({ id: dto.fiscalYearId });
    if (!subType || !fy) throw new NotFoundException('FK inválida');
    const row = this.repo.create({ amount: dto.amount, subType, fiscalYear: fy });
    return this.repo.save(row);
  }

  // GET /p-spend?subTypeId=&fiscalYearId=
  async findAll(subTypeId?: number, fiscalYearId?: number) {
    const items = await this.repo.find({
      where: {
        ...(subTypeId ? { subType: { id: subTypeId } } : {}),
        ...(fiscalYearId ? { fiscalYear: { id: fiscalYearId } } : {}),
      },
      // relaciones ya vienen eager desde las entidades
    });

    // 👇 Inyectar amountPSpend en el type para que el JSON se vea como en /spend
    for (const it of items) {
      const type = it?.subType?.type as any;
      if (type) {
        // si tu columna es string decimal en BD, devuélvela formateada
        type.amountPSpend = Number(it.amount).toFixed(2);
      }
    }
    return items;
  }

  async findOne(id: number) {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException();
    // también lo seteamos aquí para el detalle
    const type = (item as any)?.subType?.type as any;
    if (type) type.amountPSpend = Number(item.amount).toFixed(2);
    return item;
  }

  async update(id: number, dto: UpdatePSpendDto) {
    const item = await this.findOne(id);
    if (dto.subTypeId) {
      const subType = await this.subRepo.findOneBy({ id: dto.subTypeId });
      if (!subType) throw new NotFoundException('SubType no existe');
      item.subType = subType;
    }
    if (dto.fiscalYearId) {
      const fy = await this.fyRepo.findOneBy({ id: dto.fiscalYearId });
      if (!fy) throw new NotFoundException('FiscalYear no existe');
      item.fiscalYear = fy;
    }
    if (dto.amount !== undefined) item.amount = dto.amount;
    return this.repo.save(item);
  }

  async remove(id: number) {
    const item = await this.findOne(id);
    await this.repo.remove(item);
    return { ok: true };
  }
}
