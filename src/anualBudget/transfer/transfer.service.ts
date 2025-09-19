import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Transfer } from './entities/transfer.entity';
import { IncomeSubType } from 'src/anualBudget/incomeSubType/entities/income-sub-type.entity';
import { SpendSubType } from 'src/anualBudget/spendSubType/entities/spend-sub-type.entity';
import { Spend } from 'src/anualBudget/spend/entities/spend.entity';
import { FiscalYearService } from 'src/anualBudget/fiscalYear/fiscal-year.service';
import { CreateTransferDto } from './dto/createTransferDto';
import { IncomeSubTypeService } from 'src/anualBudget/incomeSubType/income-sub-type.service';
import { SpendSubTypeService } from 'src/anualBudget/spendSubType/spend-sub-type.service';

@Injectable()
export class TransferService {
  constructor(
    @InjectRepository(Transfer)      private readonly trRepo: Repository<Transfer>,
    @InjectRepository(IncomeSubType) private readonly incSubRepo: Repository<IncomeSubType>,
    @InjectRepository(SpendSubType)  private readonly spSubRepo: Repository<SpendSubType>,
    @InjectRepository(Spend)         private readonly spendRepo: Repository<Spend>,
    private readonly fyService: FiscalYearService,
    private readonly incomeSubTypeService: IncomeSubTypeService,
    private readonly spendSubTypeService: SpendSubTypeService,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  /** saldo neto materializado en amountSubIncome */
  private async getAvailable(subTypeId: number) {
    const s = await this.incSubRepo.findOne({ where: { id: subTypeId } });
    if (!s) throw new NotFoundException('IncomeSubType not found');
    return Number(s.amountSubIncome ?? 0);
  }

  async create(dto: CreateTransferDto) {
    const date = dto.date?.trim() || new Date().toISOString().slice(0, 10);
    await this.fyService.assertOpenByDate(date);

    const from = await this.incSubRepo.findOne({ where: { id: dto.incomeSubTypeId } });
    if (!from) throw new NotFoundException('IncomeSubType not found');

    const to = await this.spSubRepo.findOne({ where: { id: dto.spendSubTypeId }, relations: ['spendType'] });
    if (!to) throw new NotFoundException('SpendSubType not found');

    const amountNum = Number(dto.amount);
    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      throw new BadRequestException('amount must be > 0');
    }

    const available = await this.getAvailable(from.id);
    if (amountNum > available) {
      throw new BadRequestException('amount exceeds available balance');
    }

    return this.dataSource.transaction(async (em) => {
      // 1) crear el egreso
      const spend = em.create(Spend, {
        spendSubType: { id: to.id } as any,
        amount: amountNum.toFixed(2),
        date,
      });
      await em.save(spend);

      // 2) registrar la transferencia
      const transfer = em.create(Transfer, {
        name: dto.name ?? null,
        detail: dto.detail ?? null,
        date,
        transferAmount: amountNum.toFixed(2),
        fromIncomeSubType: { id: from.id } as any,
        toSpendSubType: { id: to.id } as any,
      });
      await em.save(transfer);

      // 3) ✅ recalcular con el MISMO manager (evita locks)
      await this.incomeSubTypeService.recalcNetWithManager(em, from.id);            // resta del ingreso
      await this.spendSubTypeService.recalcAmountSubSpendWithManager(em, to.id);    // suma al egreso

      // 4) saldo actualizado de ingreso
      const updatedFrom = await em.findOne(IncomeSubType, { where: { id: from.id } });
      const remainingFromIncomeSubType = Number(updatedFrom?.amountSubIncome ?? 0);

      return { transfer, spend, remainingFromIncomeSubType };
    });
  }

  findAll() {
    return this.trRepo.find({ order: { id: 'DESC' } });
  }
}
