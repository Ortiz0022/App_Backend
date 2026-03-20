import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PSpend } from './entities/p-spend.entity';
import { PSpendSubType } from '../pSpendSubType/entities/p-spend-sub-type.entity';
import { FiscalState, FiscalYear } from '../fiscalYear/entities/fiscal-year.entity';

import { CreatePSpendDto } from './dto/create.dto';
import { UpdatePSpendDto } from './dto/update.dto';
import { AuditBudgetService } from 'src/audit/auditBudget/audit-budget.service';
import { CurrentUserData } from 'src/auth/current-user.interface';

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
    private readonly auditBudgetService: AuditBudgetService,
    @InjectRepository(FiscalYear) private fyRepo: Repository<FiscalYear>,
  ) {}

  async create(dto: CreatePSpendDto, currentUser: CurrentUserData) {

  const subType = await this.subRepo.findOneBy({ id: dto.subTypeId });
  if (!subType) throw new NotFoundException('SubType no existe');

let fy: FiscalYear | null = null;

if (dto.fiscalYearId) {
  fy = await this.fyRepo.findOne({ where: { id: dto.fiscalYearId } });
} else {
  fy = await this.fyRepo.findOne({ where: { state: FiscalState.OPEN } });
  if (!fy) {
    fy = await this.fyRepo.findOne({ order: { year: 'DESC' } });
  }
}

if (!fy) throw new NotFoundException('No hay un FiscalYear válido');

if (fy.state === FiscalState.CLOSED) {
  throw new BadRequestException('Año fiscal CERRADO: no se permiten cambios');
}

  const amount = toNumberAmount(dto.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new BadRequestException('Monto inválido');
  }

  let date: string;
 if (dto.date) {
  const inputDate = new Date(dto.date);
  const fyStart = new Date(fy.start_date);
  const fyEnd = new Date(fy.end_date);

  if (!(inputDate >= fyStart && inputDate <= fyEnd)) {
    throw new BadRequestException('La fecha no pertenece al año fiscal seleccionado');
  }

  date = dto.date;
} else {
  date = new Date().toISOString().split('T')[0];
}

  const row = this.repo.create({
    amount,
    date,
    subType,
    fiscalYear: fy,
  });

  const saved = await this.repo.save(row);

  const savedFull = await this.findOne(saved.id);

  await this.auditBudgetService.logPSpendCreate({
    actorUserId: currentUser.id,
    pSpend: savedFull,
  });

  return saved;
}

  // GET /p-spend?subTypeId=&fiscalYearId=
  async findAll(subTypeId?: number, fiscalYearId?: number) {
    const items = await this.repo.find({
      where: {
        ...(subTypeId ? { subType: { id: subTypeId } } : {}),
        ...(fiscalYearId ? { fiscalYear: { id: fiscalYearId } } : {}),
      },
      order: { date: 'DESC' }, // ✅ Ordenar por fecha descendente
      // relaciones ya vienen eager desde las entidades
    });

    return items;
  }

  async findOne(id: number) {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException();
    return item;
  }

  async update(id: number, dto: UpdatePSpendDto, currentUser: CurrentUserData) {
  const item = await this.findOne(id);

  const before = {
    ...item,
    subType: item.subType ? { ...item.subType } : null,
    fiscalYear: item.fiscalYear ? { ...item.fiscalYear } : null,
  };

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

  if (dto.date !== undefined) {
  const nextDate = new Date(dto.date);
  const fyStart = new Date(item.fiscalYear.start_date);
  const fyEnd = new Date(item.fiscalYear.end_date);

  if (!(nextDate >= fyStart && nextDate <= fyEnd)) {
    throw new BadRequestException('La fecha no pertenece al año fiscal del registro');
  }

  item.date = nextDate;
}

  const saved = await this.repo.save(item);
  const savedFull = await this.findOne(saved.id);

  await this.auditBudgetService.logPSpendUpdate({
    actorUserId: currentUser.id,
    before: before as PSpend,
    after: savedFull,
  });

  return saved;
}

  async remove(id: number, currentUser: CurrentUserData) {
  const item = await this.findOne(id);

  await this.auditBudgetService.logPSpendDelete({
    actorUserId: currentUser.id,
    pSpend: item,
  });

  await this.repo.remove(item);
  return { ok: true };
}
}