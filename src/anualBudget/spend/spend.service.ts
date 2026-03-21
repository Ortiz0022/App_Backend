import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Spend } from './entities/spend.entity';
import { CreateSpendDto } from './dto/createSpendDto';
import { UpdateSpendDto } from './dto/updateSpendDto';
import { SpendSubType } from '../spendSubType/entities/spend-sub-type.entity';
import { SpendTypeService } from '../spendType/spend-type.service';
import { FiscalYearService } from '../fiscalYear/fiscal-year.service';
import { SpendSubTypeService } from '../spendSubType/spend-sub-type.service'; // NUEVO
import { AuditBudgetService } from 'src/audit/auditBudget/audit-budget.service';
import { CurrentUserData } from 'src/auth/current-user.interface';
import { FiscalState } from '../fiscalYear/entities/fiscal-year.entity';

@Injectable()
export class SpendService {
  constructor(
    @InjectRepository(Spend) private readonly repo: Repository<Spend>,
    @InjectRepository(SpendSubType) private readonly subRepo: Repository<SpendSubType>,
    private readonly typeService: SpendTypeService,
    private readonly fyService: FiscalYearService,
    private readonly subTypeService: SpendSubTypeService,
    private readonly auditBudgetService: AuditBudgetService,
  ) {}

  private async getSubType(id: number) {
    const s = await this.subRepo.findOne({ where: { id }, relations: ['spendType'] });
    if (!s) throw new BadRequestException('SpendSubType not found');
    return s;
  }

async create(dto: CreateSpendDto, currentUser: CurrentUserData) {
  const s = await this.getSubType(dto.spendSubTypeId);

  if (!dto.fiscalYearId) {
    throw new BadRequestException('fiscalYearId es requerido');
  }

  const fy = await this.fyService.assertSelectedOpenActiveFiscalYearByDate(
    dto.fiscalYearId,
    dto.date,
  );

  const entity = this.repo.create({
    spendSubType: { id: s.id } as any,
    amount: dto.amount,
    date: dto.date,
    fiscalYear: fy,
  });

  const saved = await this.repo.save(entity);

  await this.subTypeService.recalcAmountSubSpend(s.id);
  await this.typeService.recalcAmount(s.spendType.id);

  const savedFull = await this.findOne(saved.id);

  await this.auditBudgetService.logSpendCreate({
    actorUserId: currentUser.id,
    spend: savedFull,
  });

  return saved;
}

 async findAll(spendSubTypeId?: number, fiscalYearId?: number) {
  const where: any = {};

  if (spendSubTypeId) {
    where.spendSubType = { id: spendSubTypeId };
  }

  if (fiscalYearId) {
    where.fiscalYear = { id: fiscalYearId };
  }

  return this.repo.find({
    where,
    relations: ['spendSubType', 'spendSubType.spendType', 'fiscalYear'],
    order: { date: 'DESC', id: 'DESC' },
  });
}

  async findOne(id: number) {
    const row = await this.repo.findOne({
      where: { id },
      relations: ['spendSubType', 'spendSubType.spendType', 'fiscalYear'],
    });
    if (!row) throw new NotFoundException('Spend not found');
    return row;
  }

async update(id: number, dto: UpdateSpendDto, currentUser: CurrentUserData) {
  const row = await this.findOne(id);

  const before = {
    ...row,
    spendSubType: row.spendSubType ? { ...row.spendSubType } : null,
    fiscalYear: row.fiscalYear ? { ...row.fiscalYear } : null,
  };

  const oldSubTypeId = row.spendSubType.id;
  const oldTypeId = row.spendSubType.spendType.id;

  const newDate = dto.date ?? row.date;

  if (!dto.fiscalYearId) {
    throw new BadRequestException('fiscalYearId es requerido');
  }

  const fy = await this.fyService.assertSelectedOpenActiveFiscalYearByDate(
    dto.fiscalYearId,
    newDate,
  );

  if (dto.spendSubTypeId !== undefined) {
    const s = await this.getSubType(dto.spendSubTypeId);
    row.spendSubType = { id: s.id } as any;
  }

  if (dto.amount !== undefined) row.amount = dto.amount;

  row.date = newDate;
  row.fiscalYear = fy;

  const saved = await this.repo.save(row);

  await this.subTypeService.recalcAmountSubSpend(oldSubTypeId);
  const newSubTypeId = row.spendSubType.id;
  if (newSubTypeId !== oldSubTypeId) {
    await this.subTypeService.recalcAmountSubSpend(newSubTypeId);
  }

  await this.typeService.recalcAmount(oldTypeId);
  const newTypeId = (await this.getSubType(newSubTypeId)).spendType.id;
  if (newTypeId !== oldTypeId) {
    await this.typeService.recalcAmount(newTypeId);
  }

  const savedFull = await this.findOne(saved.id);

  await this.auditBudgetService.logSpendUpdate({
    actorUserId: currentUser.id,
    before: before as Spend,
    after: savedFull,
  });

  return saved;
}

  async remove(id: number, currentUser: CurrentUserData) {
  const row = await this.findOne(id);
  await this.fyService.assertOpenByDate(row.date);

  const subTypeId = row.spendSubType.id;
  const typeId = row.spendSubType.spendType.id;

  await this.auditBudgetService.logSpendDelete({
    actorUserId: currentUser.id,
    spend: row,
  });

  await this.repo.delete(id);

  await this.subTypeService.recalcAmountSubSpend(subTypeId);
  await this.typeService.recalcAmount(typeId);

  return { deleted: true };
}
}
