import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Extraordinary } from './entities/extraordinary.entity';
import { CreateExtraordinaryDto } from './dto/createExtraordinaryDto';
import { UpdateExtraordinaryDto } from './dto/updateExtraordinaryDto';
import { AllocateExtraordinaryDto } from './dto/allocateExtraordinaryDto';
import { IncomeType } from 'src/anualBudget/incomeType/entities/income-type.entity';
import { IncomeSubType } from 'src/anualBudget/incomeSubType/entities/income-sub-type.entity';
import { Income } from 'src/anualBudget/income/entities/income.entity';
import { AssignExtraordinaryDto } from './dto/assignExtraordinaryDto';
import { IncomeTypeService } from '../incomeType/income-type.service';
import { IncomeSubTypeService } from 'src/anualBudget/incomeSubType/income-sub-type.service';
import { FiscalYearService } from '../fiscalYear/fiscal-year.service';
import { AuditBudgetService } from 'src/audit/auditBudget/audit-budget.service';
import { CurrentUserData } from 'src/auth/current-user.interface';

function toNumber(dec: string | number | null | undefined): number {
  if (dec === null || dec === undefined) return 0;
  return typeof dec === 'number' ? dec : parseFloat(dec);
}

@Injectable()
export class ExtraordinaryService {
  constructor(
    @InjectRepository(Extraordinary) private readonly repo: Repository<Extraordinary>,
    @InjectRepository(IncomeType) private readonly typeRepo: Repository<IncomeType>,
    @InjectRepository(IncomeSubType) private readonly subRepo: Repository<IncomeSubType>,
    @InjectRepository(Income) private readonly incRepo: Repository<Income>,
    private readonly incomeTypeService: IncomeTypeService,
    private readonly incomeSubTypeService: IncomeSubTypeService,
    private readonly fiscalYearService: FiscalYearService,
    private readonly auditBudgetService: AuditBudgetService,
  ) { }

  private normalizeKey(input: string) {
    return input
      .trim()
      .replace(/\s+/g, ' ')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }

  private sanitizeLabel(input: string) {
    return input.trim().replace(/\s+/g, ' ');
  }

  private async assertNoDuplicateName(name: string, ignoreId?: number) {
    const key = this.normalizeKey(name);
    const rows = await this.repo.find({ select: { id: true, name: true } as any });

    const dup = rows.find((r) => (ignoreId ? r.id !== ignoreId : true) && this.normalizeKey(r.name) === key);
    if (dup) throw new BadRequestException('Ya existe un registro con ese nombre.');
  }

  private withCanEditAmount(e: Extraordinary) {
    return {
      ...e,
      canEditAmount: Number(e.used) === 0,
    };
  }

  async findAll(fiscalYearId?: number) {
    const where = fiscalYearId ? { fiscalYear: { id: fiscalYearId } } : {};

    const rows = await this.repo.find({
      where: where as any,
      order: { createdAt: 'DESC' },
    });

    return rows.map((e) => this.withCanEditAmount(e));
  }

  async findOne(id: number) {
    const e = await this.repo.findOne({ where: { id } });
    if (!e) throw new NotFoundException('Extraordinary not found');
    return this.withCanEditAmount(e);
  }

  async create(dto: CreateExtraordinaryDto, currentUser: CurrentUserData): Promise<Extraordinary> {
    const amountNum = Number.parseFloat(String(dto.amount));
    if (!Number.isFinite(amountNum) || amountNum < 0) {
      throw new BadRequestException('Invalid amount');
    }

    const dateStr =
      dto.date && dto.date.trim() !== '' ? dto.date : new Date().toISOString().slice(0, 10);

    const cleanName = this.sanitizeLabel(dto.name);
    await this.assertNoDuplicateName(cleanName);

    const activeFy = await this.fiscalYearService.getActiveOrCurrent();
    if (!activeFy) {
      throw new BadRequestException('No hay un año fiscal activo.');
    }

    const fyStart = String(activeFy.start_date).slice(0, 10);
    const fyEnd = String(activeFy.end_date).slice(0, 10);

    if (dateStr < fyStart || dateStr > fyEnd) {
      throw new BadRequestException(
        `La fecha debe pertenecer al año fiscal activo (${fyStart} a ${fyEnd}).`
      );
    }

    const e = this.repo.create({
      name: cleanName,
      amount: amountNum.toFixed(2),
      used: '0.00',
      date: dateStr,
      fiscalYear: activeFy,
    });

    const saved = await this.repo.save(e);

    await this.auditBudgetService.logExtraordinaryCreate({
      actorUserId: currentUser.id,
      extraordinary: saved,
    });

    return saved;
  }

  async update(id: number, dto: UpdateExtraordinaryDto, currentUser: CurrentUserData): Promise<Extraordinary> {
    const e = await this.findOne(id);
    const before = { ...e };

    if (dto.name !== undefined) {
      const cleanName = this.sanitizeLabel(dto.name);
      await this.assertNoDuplicateName(cleanName, id);
      e.name = cleanName;
    }

    if (dto.date !== undefined) {
      const nextDate = dto.date && dto.date.trim() !== '' ? dto.date : null;
      e.date = nextDate;

      if (nextDate) {
        const fy = await this.fiscalYearService.resolveByDateOrActive(nextDate);
        if (!fy) throw new BadRequestException('No hay año fiscal para la fecha');
        e.fiscalYear = fy;
      }
    }

    if (dto.amount !== undefined) {
      const usedNum = Number(e.used);

      if (!Number.isFinite(usedNum)) {
        throw new BadRequestException('Invalid used value in database');
      }

      if (usedNum > 0) {
        throw new BadRequestException(
          'No se puede editar el monto porque ya existen asignaciones (used > 0).'
        );
      }

      const amountNum = Number.parseFloat(String(dto.amount));
      if (!Number.isFinite(amountNum) || amountNum < 0) {
        throw new BadRequestException('Invalid amount');
      }

      e.amount = amountNum.toFixed(2);
    }

    const saved = await this.repo.save(e);

    await this.auditBudgetService.logExtraordinaryUpdate({
      actorUserId: currentUser.id,
      before,
      after: saved,
    });

    return saved;
  }

  async assignToIncome(dto: AssignExtraordinaryDto, currentUser: CurrentUserData) {
    return this.repo.manager.transaction(async (em: EntityManager) => {
      const extra = await em.findOne(Extraordinary, { where: { id: dto.extraordinaryId } });
      if (!extra) throw new NotFoundException('Extraordinary not found');
      const beforeExtra = { ...extra };

      const assignAmt = Number(dto.amount);
      if (!Number.isFinite(assignAmt) || assignAmt <= 0) {
        throw new BadRequestException('Amount must be positive');
      }

      const saldo = Number(extra.amount) - Number(extra.used);
      if (assignAmt > saldo) {
        throw new BadRequestException('Amount exceeds extraordinary balance');
      }

      let type = await em.findOne(IncomeType, {
        where: { name: 'MOVIMIENTO EXTRAORDINARIO', department: { id: dto.departmentId } },
        relations: ['department'],
      });
      if (!type) {
        type = em.create(IncomeType, {
          name: 'MOVIMIENTO EXTRAORDINARIO',
          department: { id: dto.departmentId } as any,
          amountIncome: '0.00',
        });
        await em.save(type);
      }

      const subNameRaw = dto.subTypeName.trim();
      if (!subNameRaw) throw new BadRequestException('subTypeName is required');

      const subName = subNameRaw.replace(/\s+/g, ' ');
      const subKey = this.normalizeKey(subName);

      const subs = await em.find(IncomeSubType, {
        where: { incomeType: { id: type.id } } as any,
        select: { id: true, name: true } as any,
      });

      let subType = subs.find((s) => this.normalizeKey(s.name) === subKey) as any;

      if (subType?.id) {
        subType = await em.findOne(IncomeSubType, { where: { id: subType.id }, relations: ['incomeType'] });
      } else {
        subType = em.create(IncomeSubType, {
          name: subName,
          incomeType: { id: type.id } as any,
          amountSubIncome: '0.00',
        });
        await em.save(subType);
      }

      const dateStr = dto.date && dto.date.trim() !== '' ? dto.date : new Date().toISOString().slice(0, 10);
      const fy = await this.fiscalYearService.resolveByDateOrActive(dateStr);
        if (!fy) throw new BadRequestException('No hay año fiscal para la fecha');

        const inc = em.create(Income, {
          incomeSubType: { id: subType.id } as any,
          amount: assignAmt.toFixed(2),
          date: dateStr,
          fiscalYear: { id: fy.id } as any,
        });
      await em.save(inc);

      extra.used = (Number(extra.used) + assignAmt).toFixed(2);
      await em.save(extra);

      await this.auditBudgetService.logExtraordinaryAssignToIncome(
        {
          actorUserId: currentUser.id,
          before: beforeExtra,
          after: extra,
          assignedAmount: dto.amount,
        },
        em,
      );

      await this.auditBudgetService.logIncomeCreate(
        {
          actorUserId: currentUser.id,
          income: inc,
          relatedExtraordinaryId: extra.id,
        },
        em,
      );

      await this.incomeSubTypeService.recalcAmountWithManager(em, subType.id);

      return { extraordinary: extra, income: inc, subType, incomeType: type };
    });
  }

  async allocate(
    id: number,
    dto: AllocateExtraordinaryDto,
    currentUser: CurrentUserData,
  ): Promise<Extraordinary> {
    const e = await this.findOne(id);

    const before = { ...e };

    const total = Number(e.amount);
    const used = Number(e.used);
    const toAllocate = Math.round(Number(dto.amount) * 100) / 100;

    if (!Number.isFinite(toAllocate) || toAllocate <= 0) {
      throw new BadRequestException('Amount must be positive');
    }

    if (used + toAllocate > total) {
      throw new BadRequestException('Allocation exceeds available balance');
    }

    e.used = (used + toAllocate).toFixed(2);

    const saved = await this.repo.save(e);

    await this.auditBudgetService.logExtraordinaryAllocate({
      actorUserId: currentUser.id,
      before,
      after: saved,
      allocatedAmount: dto.amount,
    });

    return saved;
  }

  async remove(id: number, currentUser: CurrentUserData): Promise<void> {
    const e = await this.findOne(id);

    const usedNum = Number(e.used);

    if (!Number.isFinite(usedNum)) {
      throw new BadRequestException('Invalid used value in database');
    }

    if (usedNum > 0) {
      throw new BadRequestException(
        'No se puede eliminar el registro porque ya tiene monto usado/asignado.'
      );
    }

    await this.auditBudgetService.logExtraordinaryDelete({
      actorUserId: currentUser.id,
      extraordinary: e,
    });

    await this.repo.remove(e);
  }

  async remaining(id: number): Promise<{ id: number; remaining: number }> {
    const e = await this.findOne(id);
    const remaining = Math.max(0, toNumber(e.amount) - toNumber(e.used));
    return { id: e.id, remaining: Number(remaining.toFixed(2)) };
  }
}