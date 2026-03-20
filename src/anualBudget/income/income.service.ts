import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Income } from './entities/income.entity';
import { CreateIncomeDto } from './dto/createIncomeDto';
import { UpdateIncomeDto } from './dto/updateIncomeDto';
import { IncomeSubType } from '../incomeSubType/entities/income-sub-type.entity';
import { IncomeTypeService } from '../incomeType/income-type.service';
import { FiscalYearService } from '../fiscalYear/fiscal-year.service';
import { IncomeSubTypeService } from '../incomeSubType/income-sub-type.service';
import { AuditBudgetService } from 'src/audit/auditBudget/audit-budget.service';
import { CurrentUserData } from 'src/auth/current-user.interface';
import { FiscalState } from '../fiscalYear/entities/fiscal-year.entity';

@Injectable()
export class IncomeService {
  constructor(
    @InjectRepository(Income) private readonly repo: Repository<Income>,
    @InjectRepository(IncomeSubType) private readonly subRepo: Repository<IncomeSubType>,
    private readonly typeService: IncomeTypeService,
    private readonly fyService: FiscalYearService,
    private readonly subTypeService: IncomeSubTypeService,
    private readonly auditBudgetService: AuditBudgetService,
  ) {}

  private async getSubType(id: number) {
    const s = await this.subRepo.findOne({ where: { id }, relations: ['incomeType'] });
    if (!s) throw new BadRequestException('IncomeSubType not found');
    return s;
  }

async create(dto: CreateIncomeDto, currentUser: CurrentUserData) {
  const s = await this.getSubType(dto.incomeSubTypeId);

  const fy = dto.fiscalYearId
    ? await this.fyService.findByIdSafe(dto.fiscalYearId)
    : await this.fyService.resolveByDateOrActive(dto.date);

  if (!fy) throw new BadRequestException('FiscalYear not found');

  if (fy.state === FiscalState.CLOSED) {
    throw new BadRequestException('Año fiscal CERRADO: no se permiten cambios');
  }

  if (dto.fiscalYearId && dto.date) {
    const inputDate = new Date(dto.date);
    const fyStart = new Date(fy.start_date);
    const fyEnd = new Date(fy.end_date);

    if (inputDate < fyStart || inputDate > fyEnd) {
      throw new BadRequestException('La fecha no pertenece al año fiscal seleccionado');
    }
  }

  const entity = this.repo.create({
    incomeSubType: { id: s.id } as any,
    amount: dto.amount,
    date: dto.date,
    fiscalYear: fy,
  });

  const saved = await this.repo.save(entity);

  await this.subTypeService.recalcAmount(s.id);
  await this.typeService.recalcAmount(s.incomeType.id);

  await this.auditBudgetService.logIncomeCreate({
    actorUserId: currentUser.id,
    income: saved,
    relatedExtraordinaryId: null,
  });

  return saved;
}

  async findAll(incomeSubTypeId?: number, fiscalYearId?: number) {
  const where: any = {};

  if (incomeSubTypeId) {
    where.incomeSubType = { id: incomeSubTypeId };
  }

  if (fiscalYearId) {
    where.fiscalYear = { id: fiscalYearId };
  }

  return this.repo.find({
    where,
    relations: ['incomeSubType', 'incomeSubType.incomeType', 'fiscalYear'],
    order: { date: 'DESC', id: 'DESC' },
  });
}

 async findOne(id: number) {
  const row = await this.repo.findOne({
    where: { id },
    relations: ['incomeSubType', 'incomeSubType.incomeType', 'fiscalYear'],
  });
  if (!row) throw new NotFoundException('Income not found');
  return row;
}

  async update(id: number, dto: UpdateIncomeDto, currentUser: CurrentUserData) {
    const row = await this.findOne(id);

    const before = {
      ...row,
      incomeSubType: row.incomeSubType ? { ...row.incomeSubType } : null,
      fiscalYear: row.fiscalYear ? { ...row.fiscalYear } : null,
    };

    const oldSubTypeId = row.incomeSubType.id;
    const oldTypeId = row.incomeSubType.incomeType.id;

    const newDate = dto.date ?? row.date;
    await this.fyService.assertOpenByDate(newDate);

    if (dto.incomeSubTypeId !== undefined) {
      const newSub = await this.getSubType(dto.incomeSubTypeId);
      row.incomeSubType = { id: newSub.id } as any;
    }

    if (dto.amount !== undefined) row.amount = dto.amount;
    if (dto.date !== undefined) row.date = dto.date;

    const fy = await this.fyService.resolveByDateOrActive(row.date);
      if (!fy) throw new BadRequestException('No hay año fiscal para la fecha');

      row.fiscalYear = fy;

    const saved = await this.repo.save(row);

    await this.subTypeService.recalcAmount(oldSubTypeId);
    await this.typeService.recalcAmount(oldTypeId);

    const newSubFinal = await this.getSubType(row.incomeSubType.id);
    const newSubTypeId = newSubFinal.id;
    const newTypeId = newSubFinal.incomeType.id;

    if (newSubTypeId !== oldSubTypeId) {
      await this.subTypeService.recalcAmount(newSubTypeId);
    }
    if (newTypeId !== oldTypeId) {
      await this.typeService.recalcAmount(newTypeId);
    }

    const savedFull = await this.findOne(saved.id);

    await this.auditBudgetService.logIncomeUpdate({
      actorUserId: currentUser.id,
      before: before as Income,
      after: savedFull,
    });

    return saved;
  }

  async remove(id: number, currentUser: CurrentUserData) {
    const row = await this.findOne(id);
    await this.fyService.assertOpenByDate(row.date);

    const subTypeId = row.incomeSubType.id;
    const typeId = row.incomeSubType.incomeType.id;

    await this.auditBudgetService.logIncomeDelete({
      actorUserId: currentUser.id,
      income: row,
    });

    await this.repo.delete(id);

    await this.subTypeService.recalcAmount(subTypeId);
    await this.typeService.recalcAmount(typeId);

    return { deleted: true };
  }
}
