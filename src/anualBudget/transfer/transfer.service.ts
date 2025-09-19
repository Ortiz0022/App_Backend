// src/transfer/transfer.service.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Transfer } from './entities/transfer.entity';
import { Income } from 'src/anualBudget/income/entities/income.entity';
import { IncomeSubType } from 'src/anualBudget/incomeSubType/entities/income-sub-type.entity';
import { SpendSubType } from 'src/anualBudget/spendSubType/entities/spend-sub-type.entity';
import { Spend } from 'src/anualBudget/spend/entities/spend.entity';
import { SpendTypeService } from 'src/anualBudget/spendType/spend-type.service';
import { FiscalYearService } from 'src/anualBudget/fiscalYear/fiscal-year.service';
import { CreateTransferDto } from './dto/createTransferDto';
import { TransferResponseDto } from './dto/transferResponseDto';
import { IncomeTypeService } from '../incomeType/income-type.service';
import { IncomeType } from '../incomeType/entities/income-type.entity';

@Injectable()
export class TransferService {
  constructor(
    @InjectRepository(Transfer)     private readonly trRepo: Repository<Transfer>,
    @InjectRepository(Income)       private readonly incomeRepo: Repository<Income>,
    @InjectRepository(IncomeSubType)private readonly incSubRepo: Repository<IncomeSubType>,
    @InjectRepository(SpendSubType) private readonly spSubRepo: Repository<SpendSubType>,
    @InjectRepository(Spend)        private readonly spendRepo: Repository<Spend>,
    private readonly spendTypeService: SpendTypeService,
    private readonly fyService: FiscalYearService,
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly incomeTypeService: IncomeTypeService, 
  ) {}

  /** Saldo disponible del Subtipo de Ingreso: SUM(income) - SUM(transfers out) */
  async getIncomeSubTypeBalance(subTypeId: number): Promise<number> {
    const totalInRaw = await this.incomeRepo
      .createQueryBuilder('i')
      .select('COALESCE(SUM(i.amount),0)', 'total')
      .where('i.incomeSubType = :id', { id: subTypeId })
      .getRawOne<{ total: string }>();

    const totalOutRaw = await this.trRepo
      .createQueryBuilder('t')
      .select('COALESCE(SUM(t.transferAmount),0)', 'total')
      .where('t.fromIncomeSubType = :id', { id: subTypeId })
      .getRawOne<{ total: string }>();

    const totalIn = Number(totalInRaw?.total ?? 0);
    const totalOut = Number(totalOutRaw?.total ?? 0);
    return Number((totalIn - totalOut).toFixed(2));
  }

  // async create(dto: CreateTransferDto): Promise<TransferResponseDto> {
  //   const date = dto.date ?? new Date().toISOString().slice(0, 10);
  //   await this.fyService.assertOpenByDate(date);

  //   const from = await this.incSubRepo.findOne({ where: { id: dto.incomeSubTypeId }, relations: ['incomeType'] });
  //   if (!from) throw new NotFoundException('IncomeSubType not found');

  //   const to = await this.spSubRepo.findOne({ where: { id: dto.spendSubTypeId }, relations: ['spendType'] });
  //   if (!to) throw new NotFoundException('SpendSubType not found');

  //   const amountNum = Number(dto.amount);
  //   if (!Number.isFinite(amountNum)) throw new BadRequestException('Invalid amount');
  //   if (amountNum <= 0) throw new BadRequestException('amount must be > 0');

  //   const balance = await this.getIncomeSubTypeBalance(from.id);
  //   if (amountNum > balance) throw new BadRequestException('amount exceeds available balance');

  //   return this.dataSource.transaction(async (em) => {
  //     // 1) SPEND
  //     const spend = em.create(Spend, {
  //       spendSubType: { id: to.id } as any,
  //       amount: amountNum.toFixed(2),
  //       date,
  //     });
  //     await em.save(spend);

  //     // 2) TRANSFER (rastro)
  //     const transfer = em.create(Transfer, {
  //       name: dto.name ?? null,
  //       detail: dto.detail ?? null,
  //       date,
  //       transferAmount: amountNum.toFixed(2),
  //       fromIncomeSubType: { id: from.id } as any,
  //       toSpendSubType: { id: to.id } as any,
  //     });
  //     await em.save(transfer);

  //     // 3) Recalcular EGRESO destino (total por tipo)
  //     await this.spendTypeService.recalcAmount(to.spendType.id);

  //     // 4) Recalcular INGRESO origen (NETO = ingresos - transfers)
  //     await this.incomeTypeService.recalcAmountWithManager(em, from.incomeType.id); // ⬅️ clave

  //     // 5) Saldo restante del subtipo de ingreso
  //     const remaining = await this.getIncomeSubTypeBalance(from.id);

  //     const netIncomeType = await em.getRepository(IncomeType).findOne({ where: { id: from.incomeType.id } });
  //     return { transfer, spend, remainingFromIncomeSubType: remaining, incomeType: netIncomeType };
  //   });
  // }

  findAll() {
    return this.trRepo.find({ order: { id: 'DESC' } });
  }
}
