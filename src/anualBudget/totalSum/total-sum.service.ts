// src/anualBudget/totalSum/total-sum.service.ts (o la ruta que uses)
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TotalSum } from './entities/total-sum.entity';
import { FiscalYear } from '../fiscalYear/entities/fiscal-year.entity';
import { Income } from '../income/entities/income.entity';
import { Spend } from '../spend/entities/spend.entity';
import { Transfer } from '../transfer/entities/transfer.entity';
// ⬇️ NUEVO


@Injectable()
export class TotalSumService {
  constructor(
    @InjectRepository(TotalSum)   private readonly repo: Repository<TotalSum>,
    @InjectRepository(FiscalYear) private readonly fyRepo: Repository<FiscalYear>,
    @InjectRepository(Income)     private readonly incomeRepo: Repository<Income>,
    @InjectRepository(Spend)      private readonly spendRepo: Repository<Spend>,
    // ⬇️ NUEVO
    @InjectRepository(Transfer)   private readonly trRepo: Repository<Transfer>,
  ) {}

  async recalcForFiscalYear(fiscalYearId: number): Promise<TotalSum> {
    const fy = await this.fyRepo.findOne({ where: { id: fiscalYearId } });
    if (!fy) throw new NotFoundException('FiscalYear not found');

    const params = { start: fy.start_date, end: fy.end_date };

    // ===== INGRESOS NETOS POR FY =====
    // Bruto en el FY
    const incRaw = await this.incomeRepo
      .createQueryBuilder('i')
      .where('i.date >= :start AND i.date <= :end', params)
      .select('COALESCE(SUM(i.amount), 0)', 'total')
      .getRawOne<{ total: string }>();

    // Transferencias saliendo de ingresos en el FY
    const trRaw = await this.trRepo
      .createQueryBuilder('t')
      .where('t.date >= :start AND t.date <= :end', params)
      .select('COALESCE(SUM(t.transferAmount), 0)', 'total')
      .getRawOne<{ total: string }>();

    const totalIncome = (
      Number(incRaw?.total ?? 0) - Number(trRaw?.total ?? 0)
    ).toFixed(2);

    // ===== EGRESOS REALES POR FY =====
    const subTypeTotals = await this.spendRepo
      .createQueryBuilder('sp')
      .innerJoin('sp.spendSubType', 'sst')
      .where('sp.date >= :start AND sp.date <= :end', params)
      .select('sst.id', 'subTypeId')
      .addSelect('COALESCE(SUM(sp.amount), 0)', 'total')
      .groupBy('sst.id')
      .getRawMany<{ subTypeId: number; total: string }>();

    const totalSpend = Number(
      subTypeTotals.reduce((acc, r) => acc + Number(r.total ?? 0), 0)
    ).toFixed(2);

    // ===== UPSERT SNAPSHOT =====
    let snap = await this.repo.findOne({ where: { fiscalYear: { id: fy.id } as any } });
    if (!snap) {
      snap = this.repo.create({
        fiscalYear: { id: fy.id } as any,
        total_income: '0.00',
        total_spend: '0.00',
      });
    }
    snap.total_income = totalIncome;
    snap.total_spend  = totalSpend;

    await this.repo.save(snap);
    return this.findByFiscalYear(fy.id);
  }

  findByFiscalYear(fiscalYearId: number): Promise<TotalSum> {
    return this.repo.findOne({ where: { fiscalYear: { id: fiscalYearId } as any } }) as Promise<TotalSum>;
  }

  findAll(): Promise<TotalSum[]> {
    return this.repo.find({ order: { id: 'DESC' } });
  }
}
