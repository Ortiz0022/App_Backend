import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PSpend } from './entities/p-spend.entity';
import { PSpendSubType } from '../pSpendSubType/entities/p-spend-sub-type.entity';
import { FiscalState, FiscalYear } from '../fiscalYear/entities/fiscal-year.entity';

import { CreatePSpendDto } from './dto/create.dto';
import { UpdatePSpendDto } from './dto/update.dto';

function toNumberAmount(v: any): number {
  // Ej.: "₡10 125,00" | "10,125.50" | "10125.50" -> 10125.5
  const n = Number(String(v).replace(/[^\d.]/g, ''));
  return Number.isFinite(n) ? n : NaN;
}

@Injectable()
export class PSpendService {
  constructor(
    @InjectRepository(PSpend) private repo: Repository<PSpend>,
    @InjectRepository(PSpendSubType) private subRepo: Repository<PSpendSubType>,
    @InjectRepository(FiscalYear) private fyRepo: Repository<FiscalYear>,
  ) {}

  async create(dto: CreatePSpendDto) {
    console.log('[PSpend.create] DTO recibido:', dto);

    // 1) Subtipo obligatorio
    const subType = await this.subRepo.findOneBy({ id: dto.subTypeId });
    if (!subType) throw new NotFoundException('SubType no existe');

    // 2) Inferir FiscalYear (primero OPEN, si no existe toma el más reciente)
    let fy = await this.fyRepo.findOne({ where: { state: FiscalState.OPEN } });
    if (!fy) {
      fy = await this.fyRepo.findOne({ order: { year: 'DESC' } });
    }
    if (!fy) throw new NotFoundException('No hay un FiscalYear válido (OPEN o reciente)');

    // 3) Normalizar y validar monto
    const amount = toNumberAmount(dto.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      console.log('[PSpend.create] Monto inválido calculado:', dto.amount, '->', amount);
      throw new BadRequestException('Monto inválido');
    }

    // 4) Guardar
    const row = this.repo.create({ amount, subType, fiscalYear: fy });
    const saved = await this.repo.save(row);
    console.log('[PSpend.create] Guardado:', saved);
    return saved;
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

    // Inyectar amountPSpend en el type para mantener el shape esperado
    for (const it of items) {
      const type = (it as any)?.subType?.type as any;
      if (type) type.amountPSpend = Number(it.amount).toFixed(2);
    }
    return items;
  }

  async findOne(id: number) {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException();
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
    if (dto.amount !== undefined) {
      const amount = toNumberAmount(dto.amount as any);
      if (!Number.isFinite(amount) || amount <= 0) {
        throw new BadRequestException('Monto inválido');
      }
      item.amount = amount;
    }
    return this.repo.save(item);
  }

  async remove(id: number) {
    const item = await this.findOne(id);
    await this.repo.remove(item);
    return { ok: true };
  }
}
