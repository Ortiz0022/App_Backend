import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PIncome } from '../pIncome/entities/pIncome.entity';
import { PIncomeSubType } from '../pIncomeSubType/entities/pincome-sub-type.entity';
import { PIncomeTypeService } from '../pIncomeType/pincome-type.service';   // <-- nuevo
import { FiscalYearService } from '../fiscalYear/fiscal-year.service';
import { AuditBudgetService } from 'src/audit/auditBudget/audit-budget.service';
import { CurrentUserData } from 'src/auth/current-user.interface';

@Injectable()
export class PIncomeService {
  constructor(
    @InjectRepository(PIncome) private readonly repo: Repository<PIncome>,
    @InjectRepository(PIncomeSubType) private readonly subRepo: Repository<PIncomeSubType>,
    private readonly pIncomeTypeService: PIncomeTypeService,
    private readonly fyService: FiscalYearService, 
    private readonly auditBudgetService: AuditBudgetService,
    
  ) {}


  private async getSubType(id: number) {
    const s = await this.subRepo.findOne({ where: { id }, relations: ['pIncomeType'] });
    if (!s) throw new BadRequestException('PIncomeSubType not found');
    return s;
  }

  async create(dto: { pIncomeSubTypeId: number; amount: string }, currentUser: CurrentUserData) {
  const s = await this.getSubType(dto.pIncomeSubTypeId);
  const fy = await this.fyService.getActiveOrCurrent();
  if (!fy) throw new BadRequestException('No hay año fiscal activo o disponible');

  const entity = this.repo.create({
    pIncomeSubType: { id: s.id } as any,
    amount: dto.amount,
    fiscalYear: fy,
  });

  const saved = await this.repo.save(entity);

  await this.pIncomeTypeService.recalcAmount(s.pIncomeType.id);

  const savedFull = await this.findOne(saved.id);

  await this.auditBudgetService.logPIncomeCreate({
    actorUserId: currentUser.id,
    pIncome: savedFull,
  });

  return saved;
}

  async findOne(id: number) {
  const row = await this.repo.findOne({
    where: { id },
    relations: ['pIncomeSubType', 'pIncomeSubType.pIncomeType', 'fiscalYear'],
  });
  if (!row) throw new NotFoundException('PIncome not found');
  return row;
}

async findAll(pIncomeSubTypeId?: number, fiscalYearId?: number) {
  const where: any = {};

  if (pIncomeSubTypeId) {
    where.pIncomeSubType = { id: pIncomeSubTypeId };
  }

  if (fiscalYearId) {
    where.fiscalYear = { id: fiscalYearId };
  }

  return this.repo.find({
    where,
    relations: [
      'pIncomeSubType',
      'pIncomeSubType.pIncomeType',
      'fiscalYear',
    ],
    order: { id: 'DESC' },
  });
}

async update(
  id: number,
  dto: { pIncomeSubTypeId?: number; amount?: string },
  currentUser: CurrentUserData,
) {
  const row = await this.findOne(id);

  const before = {
    ...row,
    pIncomeSubType: row.pIncomeSubType ? { ...row.pIncomeSubType } : null,
    fiscalYear: row.fiscalYear ? { ...row.fiscalYear } : null,
  };

  const oldTypeId = row.pIncomeSubType.pIncomeType.id;

  if (dto.pIncomeSubTypeId !== undefined) {
    const s = await this.getSubType(dto.pIncomeSubTypeId);
    row.pIncomeSubType = { id: s.id } as any;
  }

  if (dto.amount !== undefined) row.amount = dto.amount;

  if (!row.fiscalYear) {
  const fy = await this.fyService.getActiveOrCurrent();
  if (!fy) throw new BadRequestException('No hay año fiscal activo o disponible');
  row.fiscalYear = fy;
}

  const saved = await this.repo.save(row);

  const newTypeId = (await this.getSubType(row.pIncomeSubType.id)).pIncomeType.id;
  await this.pIncomeTypeService.recalcAmount(oldTypeId);
  if (newTypeId !== oldTypeId) {
    await this.pIncomeTypeService.recalcAmount(newTypeId);
  }

  const savedFull = await this.findOne(saved.id);

  await this.auditBudgetService.logPIncomeUpdate({
    actorUserId: currentUser.id,
    before: before as PIncome,
    after: savedFull,
  });

  return saved;
}

  async remove(id: number, currentUser: CurrentUserData) {
  const row = await this.findOne(id);
  const typeId = row.pIncomeSubType.pIncomeType.id;

  await this.auditBudgetService.logPIncomeDelete({
    actorUserId: currentUser.id,
    pIncome: row,
  });

  await this.repo.delete(id);
  await this.pIncomeTypeService.recalcAmount(typeId);

  return { deleted: true };
}
}
