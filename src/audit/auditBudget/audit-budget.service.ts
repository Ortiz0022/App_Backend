import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository, SelectQueryBuilder } from 'typeorm';
import { AuditBudget } from './entities/audit-budget.entity';
import { FindAuditBudgetDto } from './dto/find-audit-budget.dto';
import { AuditBudgetEntity } from './dto/audit-budget-entity.enum';
import { AuditBudgetAction } from './dto/audit-budget-action.enum';
import { AuditBudgetScope } from './dto/audit-budget-scope.enum';
import { Extraordinary } from 'src/anualBudget/extraordinary/entities/extraordinary.entity';
import { Income } from 'src/anualBudget/income/entities/income.entity';
import { Spend } from 'src/anualBudget/spend/entities/spend.entity';

export interface CreateAuditBudgetLogParams {
  actorUserId?: number | null;
  entityType: AuditBudgetEntity;
  entityId: number;
  actionType: AuditBudgetAction;
  budgetScope: AuditBudgetScope;
  oldAmount?: string | null;
  newAmount?: string | null;
  oldUsed?: string | null;
  newUsed?: string | null;
  oldDate?: string | null;
  newDate?: string | null;
  oldName?: string | null;
  newName?: string | null;
  fiscalYearId?: number | null;
  subTypeTable?: string | null;
  subTypeId?: number | null;
  relatedExtraordinaryId?: number | null;
  description?: string | null;
  snapshotBefore?: Record<string, any> | null;
  snapshotAfter?: Record<string, any> | null;
}
//extraordinary interfaces
export interface LogExtraordinaryCreateParams {
  actorUserId: number;
  extraordinary: Extraordinary;
}

export interface LogExtraordinaryUpdateParams {
  actorUserId: number;
  before: Extraordinary;
  after: Extraordinary;
}

export interface LogExtraordinaryDeleteParams {
  actorUserId: number;
  extraordinary: Extraordinary;
}

export interface LogExtraordinaryAllocateParams {
  actorUserId: number;
  before: Extraordinary;
  after: Extraordinary;
  allocatedAmount: number | string;
}

export interface LogExtraordinaryAssignToIncomeParams {
  actorUserId: number;
  before: Extraordinary;
  after: Extraordinary;
  assignedAmount: number | string;
}

//Income interfaces
export interface LogIncomeCreateParams {
  actorUserId: number;
  income: Income;
  relatedExtraordinaryId?: number | null;
}

export interface LogIncomeUpdateParams {
  actorUserId: number;
  before: Income;
  after: Income;
}

export interface LogIncomeDeleteParams {
  actorUserId: number;
  income: Income;
}

//spend interfaces
export interface LogSpendCreateParams {
  actorUserId: number;
  spend: Spend;
}

export interface LogSpendUpdateParams {
  actorUserId: number;
  before: Spend;
  after: Spend;
}

export interface LogSpendDeleteParams {
  actorUserId: number;
  spend: Spend;
}
//close spend interfaces

@Injectable()
export class AuditBudgetService {
  constructor(
    @InjectRepository(AuditBudget)
    private readonly auditBudgetRepository: Repository<AuditBudget>,
  ) {}

  async createLog(
    params: CreateAuditBudgetLogParams,
    manager?: EntityManager,
  ): Promise<AuditBudget> {
    const repo = manager
      ? manager.getRepository(AuditBudget)
      : this.auditBudgetRepository;

    const log = repo.create({
      actorUser: params.actorUserId ? ({ id: params.actorUserId } as any) : null,
      entityType: params.entityType,
      entityId: params.entityId,
      actionType: params.actionType,
      budgetScope: params.budgetScope,
      oldAmount: params.oldAmount ?? null,
      newAmount: params.newAmount ?? null,
      oldUsed: params.oldUsed ?? null,
      newUsed: params.newUsed ?? null,
      oldDate: params.oldDate ?? null,
      newDate: params.newDate ?? null,
      oldName: params.oldName ?? null,
      newName: params.newName ?? null,
      fiscalYear: params.fiscalYearId ? ({ id: params.fiscalYearId } as any) : null,
      subTypeTable: params.subTypeTable ?? null,
      subTypeId: params.subTypeId ?? null,
      relatedExtraordinary: params.relatedExtraordinaryId
        ? ({ id: params.relatedExtraordinaryId } as any)
        : null,
      description: params.description ?? null,
      snapshotBefore: params.snapshotBefore ?? null,
      snapshotAfter: params.snapshotAfter ?? null,
    });

    return repo.save(log);
  }
// Specific methods for extraordinary logs
  async logExtraordinaryCreate(
  params: LogExtraordinaryCreateParams,
): Promise<AuditBudget> {
  const { actorUserId, extraordinary } = params;

  return this.createLog({
    actorUserId,
    entityType: AuditBudgetEntity.EXTRAORDINARY,
    entityId: extraordinary.id,
    actionType: AuditBudgetAction.CREATE,
    budgetScope: AuditBudgetScope.EXTRAORDINARY,
    oldAmount: null,
    newAmount: extraordinary.amount,
    oldUsed: null,
    newUsed: extraordinary.used,
    oldDate: null,
    newDate: extraordinary.date ?? null,
    oldName: null,
    newName: extraordinary.name,
    fiscalYearId: null,
    subTypeTable: null,
    subTypeId: null,
    relatedExtraordinaryId: extraordinary.id,
    description: 'Creación de registro extraordinario',
    snapshotBefore: null,
    snapshotAfter: {
      id: extraordinary.id,
      name: extraordinary.name,
      amount: extraordinary.amount,
      used: extraordinary.used,
      date: extraordinary.date,
      createdAt: extraordinary.createdAt,
      updatedAt: extraordinary.updatedAt,
    },
  });
}

async logExtraordinaryUpdate(
  params: LogExtraordinaryUpdateParams,
): Promise<AuditBudget> {

  const { actorUserId, before, after } = params;

  return this.createLog({
    actorUserId,
    entityType: AuditBudgetEntity.EXTRAORDINARY,
    entityId: after.id,
    actionType: AuditBudgetAction.UPDATE,
    budgetScope: AuditBudgetScope.EXTRAORDINARY,

    oldAmount: before.amount,
    newAmount: after.amount,

    oldUsed: before.used,
    newUsed: after.used,

    oldDate: before.date ?? null,
    newDate: after.date ?? null,

    oldName: before.name,
    newName: after.name,

    relatedExtraordinaryId: after.id,

    description: 'Actualización de registro extraordinario',

    snapshotBefore: {
      id: before.id,
      name: before.name,
      amount: before.amount,
      used: before.used,
      date: before.date,
      createdAt: before.createdAt,
      updatedAt: before.updatedAt,
    },

    snapshotAfter: {
      id: after.id,
      name: after.name,
      amount: after.amount,
      used: after.used,
      date: after.date,
      createdAt: after.createdAt,
      updatedAt: after.updatedAt,
    },
  });
}

async logExtraordinaryDelete(
  params: LogExtraordinaryDeleteParams,
): Promise<AuditBudget> {
  const { actorUserId, extraordinary } = params;

  return this.createLog({
    actorUserId,
    entityType: AuditBudgetEntity.EXTRAORDINARY,
    entityId: extraordinary.id,
    actionType: AuditBudgetAction.DELETE,
    budgetScope: AuditBudgetScope.EXTRAORDINARY,

    oldAmount: extraordinary.amount,
    newAmount: null,

    oldUsed: extraordinary.used,
    newUsed: null,

    oldDate: extraordinary.date ?? null,
    newDate: null,

    oldName: extraordinary.name,
    newName: null,

    relatedExtraordinaryId: extraordinary.id,

    description: 'Eliminación de registro extraordinario',

    snapshotBefore: {
      id: extraordinary.id,
      name: extraordinary.name,
      amount: extraordinary.amount,
      used: extraordinary.used,
      date: extraordinary.date,
      createdAt: extraordinary.createdAt,
      updatedAt: extraordinary.updatedAt,
    },

    snapshotAfter: null,
  });
}

async logExtraordinaryAllocate(
  params: LogExtraordinaryAllocateParams,
): Promise<AuditBudget> {
  const { actorUserId, before, after, allocatedAmount } = params;

  return this.createLog({
    actorUserId,
    entityType: AuditBudgetEntity.EXTRAORDINARY,
    entityId: after.id,
    actionType: AuditBudgetAction.ALLOCATE,
    budgetScope: AuditBudgetScope.EXTRAORDINARY,

    oldAmount: before.amount,
    newAmount: after.amount,

    oldUsed: before.used,
    newUsed: after.used,

    oldDate: before.date ?? null,
    newDate: after.date ?? null,

    oldName: before.name,
    newName: after.name,

    relatedExtraordinaryId: after.id,

    description: `Asignación de monto extraordinario: ${allocatedAmount}`,

    snapshotBefore: {
      id: before.id,
      name: before.name,
      amount: before.amount,
      used: before.used,
      date: before.date,
      createdAt: before.createdAt,
      updatedAt: before.updatedAt,
    },

    snapshotAfter: {
      id: after.id,
      name: after.name,
      amount: after.amount,
      used: after.used,
      date: after.date,
      createdAt: after.createdAt,
      updatedAt: after.updatedAt,
    },
  });
}

async logExtraordinaryAssignToIncome(
  params: LogExtraordinaryAssignToIncomeParams,
  manager?: EntityManager,
): Promise<AuditBudget> {
  const { actorUserId, before, after, assignedAmount } = params;

  return this.createLog(
    {
      actorUserId,
      entityType: AuditBudgetEntity.EXTRAORDINARY,
      entityId: after.id,
      actionType: AuditBudgetAction.ASSIGN_TO_INCOME,
      budgetScope: AuditBudgetScope.EXTRAORDINARY,

      oldAmount: before.amount,
      newAmount: after.amount,

      oldUsed: before.used,
      newUsed: after.used,

      oldDate: before.date ?? null,
      newDate: after.date ?? null,

      oldName: before.name,
      newName: after.name,

      relatedExtraordinaryId: after.id,

      description: `Asignación de extraordinario a ingreso: ${assignedAmount}`,

      snapshotBefore: {
        id: before.id,
        name: before.name,
        amount: before.amount,
        used: before.used,
        date: before.date,
        createdAt: before.createdAt,
        updatedAt: before.updatedAt,
      },

      snapshotAfter: {
        id: after.id,
        name: after.name,
        amount: after.amount,
        used: after.used,
        date: after.date,
        createdAt: after.createdAt,
        updatedAt: after.updatedAt,
      },
    },
    manager,
  );
}
//close specific methods for extraordinary logs

//General methods for income logs
async logIncomeCreate(
  params: LogIncomeCreateParams,
  manager?: EntityManager,
): Promise<AuditBudget> {
  const { actorUserId, income, relatedExtraordinaryId } = params;

  const description = relatedExtraordinaryId
    ? 'Creación de ingreso real desde movimiento extraordinario'
    : 'Creación de ingreso real';

  return this.createLog(
    {
      actorUserId,
      entityType: AuditBudgetEntity.INCOME,
      entityId: income.id,
      actionType: AuditBudgetAction.CREATE,
      budgetScope: AuditBudgetScope.REAL,

      oldAmount: null,
      newAmount: income.amount,

      oldUsed: null,
      newUsed: null,

      oldDate: null,
      newDate: income.date ?? null,

      oldName: null,
      newName: null,

      fiscalYearId: income.fiscalYear?.id ?? null,
      subTypeTable: 'income_sub_type',
      subTypeId: income.incomeSubType?.id ?? null,
      relatedExtraordinaryId: relatedExtraordinaryId ?? null,

      description,

      snapshotBefore: null,

      snapshotAfter: {
        id: income.id,
        amount: income.amount,
        date: income.date,
        fiscalYearId: income.fiscalYear?.id ?? null,
        incomeSubTypeId: income.incomeSubType?.id ?? null,
      },
    },
    manager,
  );
}

async logIncomeUpdate(
  params: LogIncomeUpdateParams,
  manager?: EntityManager,
): Promise<AuditBudget> {
  const { actorUserId, before, after } = params;

  return this.createLog(
    {
      actorUserId,
      entityType: AuditBudgetEntity.INCOME,
      entityId: after.id,
      actionType: AuditBudgetAction.UPDATE,
      budgetScope: AuditBudgetScope.REAL,

      oldAmount: before.amount,
      newAmount: after.amount,

      oldUsed: null,
      newUsed: null,

      oldDate: before.date ?? null,
      newDate: after.date ?? null,

      oldName: null,
      newName: null,

      fiscalYearId: after.fiscalYear?.id ?? null,
      subTypeTable: 'income_sub_type',
      subTypeId: after.incomeSubType?.id ?? null,
      relatedExtraordinaryId: null,

      description: 'Actualización de ingreso real',

      snapshotBefore: {
        id: before.id,
        amount: before.amount,
        date: before.date,
        fiscalYearId: before.fiscalYear?.id ?? null,
        incomeSubTypeId: before.incomeSubType?.id ?? null,
      },

      snapshotAfter: {
        id: after.id,
        amount: after.amount,
        date: after.date,
        fiscalYearId: after.fiscalYear?.id ?? null,
        incomeSubTypeId: after.incomeSubType?.id ?? null,
      },
    },
    manager,
  );
}

async logIncomeDelete(
  params: LogIncomeDeleteParams,
  manager?: EntityManager,
): Promise<AuditBudget> {
  const { actorUserId, income } = params;

  return this.createLog(
    {
      actorUserId,
      entityType: AuditBudgetEntity.INCOME,
      entityId: income.id,
      actionType: AuditBudgetAction.DELETE,
      budgetScope: AuditBudgetScope.REAL,

      oldAmount: income.amount,
      newAmount: null,

      oldUsed: null,
      newUsed: null,

      oldDate: income.date ?? null,
      newDate: null,

      oldName: null,
      newName: null,

      fiscalYearId: income.fiscalYear?.id ?? null,
      subTypeTable: 'income_sub_type',
      subTypeId: income.incomeSubType?.id ?? null,
      relatedExtraordinaryId: null,

      description: 'Eliminación de ingreso real',

      snapshotBefore: {
        id: income.id,
        amount: income.amount,
        date: income.date,
        fiscalYearId: income.fiscalYear?.id ?? null,
        incomeSubTypeId: income.incomeSubType?.id ?? null,
      },

      snapshotAfter: null,
    },
    manager,
  );
}

//close general methods for income logs

//general methods for spend logs
async logSpendCreate(
  params: LogSpendCreateParams,
  manager?: EntityManager,
): Promise<AuditBudget> {
  const { actorUserId, spend } = params;

  return this.createLog(
    {
      actorUserId,
      entityType: AuditBudgetEntity.SPEND,
      entityId: spend.id,
      actionType: AuditBudgetAction.CREATE,
      budgetScope: AuditBudgetScope.REAL,

      oldAmount: null,
      newAmount: spend.amount,

      oldUsed: null,
      newUsed: null,

      oldDate: null,
      newDate: spend.date ?? null,

      oldName: null,
      newName: null,

      fiscalYearId: spend.fiscalYear?.id ?? null,
      subTypeTable: 'spend_sub_type',
      subTypeId: spend.spendSubType?.id ?? null,
      relatedExtraordinaryId: null,

      description: 'Creación de egreso real',

      snapshotBefore: null,

      snapshotAfter: {
        id: spend.id,
        amount: spend.amount,
        date: spend.date,
        fiscalYearId: spend.fiscalYear?.id ?? null,
        spendSubTypeId: spend.spendSubType?.id ?? null,
      },
    },
    manager,
  );
}

async logSpendUpdate(
  params: LogSpendUpdateParams,
  manager?: EntityManager,
): Promise<AuditBudget> {
  const { actorUserId, before, after } = params;

  return this.createLog(
    {
      actorUserId,
      entityType: AuditBudgetEntity.SPEND,
      entityId: after.id,
      actionType: AuditBudgetAction.UPDATE,
      budgetScope: AuditBudgetScope.REAL,

      oldAmount: before.amount,
      newAmount: after.amount,

      oldUsed: null,
      newUsed: null,

      oldDate: before.date ?? null,
      newDate: after.date ?? null,

      oldName: null,
      newName: null,

      fiscalYearId: after.fiscalYear?.id ?? null,
      subTypeTable: 'spend_sub_type',
      subTypeId: after.spendSubType?.id ?? null,
      relatedExtraordinaryId: null,

      description: 'Actualización de egreso real',

      snapshotBefore: {
        id: before.id,
        amount: before.amount,
        date: before.date,
        fiscalYearId: before.fiscalYear?.id ?? null,
        spendSubTypeId: before.spendSubType?.id ?? null,
      },

      snapshotAfter: {
        id: after.id,
        amount: after.amount,
        date: after.date,
        fiscalYearId: after.fiscalYear?.id ?? null,
        spendSubTypeId: after.spendSubType?.id ?? null,
      },
    },
    manager,
  );
}

async logSpendDelete(
  params: LogSpendDeleteParams,
  manager?: EntityManager,
): Promise<AuditBudget> {
  const { actorUserId, spend } = params;

  return this.createLog(
    {
      actorUserId,
      entityType: AuditBudgetEntity.SPEND,
      entityId: spend.id,
      actionType: AuditBudgetAction.DELETE,
      budgetScope: AuditBudgetScope.REAL,

      oldAmount: spend.amount,
      newAmount: null,

      oldUsed: null,
      newUsed: null,

      oldDate: spend.date ?? null,
      newDate: null,

      oldName: null,
      newName: null,

      fiscalYearId: spend.fiscalYear?.id ?? null,
      subTypeTable: 'spend_sub_type',
      subTypeId: spend.spendSubType?.id ?? null,
      relatedExtraordinaryId: null,

      description: 'Eliminación de egreso real',

      snapshotBefore: {
        id: spend.id,
        amount: spend.amount,
        date: spend.date,
        fiscalYearId: spend.fiscalYear?.id ?? null,
        spendSubTypeId: spend.spendSubType?.id ?? null,
      },

      snapshotAfter: null,
    },
    manager,
  );
}

//close general methods for spend logs
  async findAll(filters: FindAuditBudgetDto): Promise<AuditBudget[]> {
    const qb = this.auditBudgetRepository
      .createQueryBuilder('audit')
      .leftJoinAndSelect('audit.actorUser', 'actorUser')
      .leftJoinAndSelect('audit.fiscalYear', 'fiscalYear')
      .leftJoinAndSelect('audit.relatedExtraordinary', 'relatedExtraordinary')
      .orderBy('audit.createdAt', 'DESC');

    this.applyFilters(qb, filters);

    return qb.getMany();
  }

  async findOne(id: number): Promise<AuditBudget> {
    const log = await this.auditBudgetRepository.findOne({
      where: { id },
      relations: ['actorUser', 'fiscalYear', 'relatedExtraordinary'],
    });

    if (!log) {
      throw new NotFoundException(`Registro de auditoría ${id} no encontrado`);
    }

    return log;
  }

  private applyFilters(
    qb: SelectQueryBuilder<AuditBudget>,
    filters: FindAuditBudgetDto,
  ) {
    if (filters.entityType) {
      qb.andWhere('audit.entityType = :entityType', {
        entityType: filters.entityType,
      });
    }

    if (filters.entityId !== undefined) {
      qb.andWhere('audit.entityId = :entityId', {
        entityId: filters.entityId,
      });
    }

    if (filters.actionType) {
      qb.andWhere('audit.actionType = :actionType', {
        actionType: filters.actionType,
      });
    }

    if (filters.budgetScope) {
      qb.andWhere('audit.budgetScope = :budgetScope', {
        budgetScope: filters.budgetScope,
      });
    }

    if (filters.actorUserId !== undefined) {
      qb.andWhere('actorUser.id = :actorUserId', {
        actorUserId: filters.actorUserId,
      });
    }

    if (filters.subTypeTable) {
      qb.andWhere('audit.subTypeTable = :subTypeTable', {
        subTypeTable: filters.subTypeTable,
      });
    }

    if (filters.subTypeId !== undefined) {
      qb.andWhere('audit.subTypeId = :subTypeId', {
        subTypeId: filters.subTypeId,
      });
    }

    if (filters.relatedExtraordinaryId !== undefined) {
      qb.andWhere('relatedExtraordinary.id = :relatedExtraordinaryId', {
        relatedExtraordinaryId: filters.relatedExtraordinaryId,
      });
    }

    if (filters.from) {
      qb.andWhere('audit.createdAt >= :from', {
        from: `${filters.from} 00:00:00`,
      });
    }

    if (filters.to) {
      qb.andWhere('audit.createdAt <= :to', {
        to: `${filters.to} 23:59:59`,
      });
    }
  }
}