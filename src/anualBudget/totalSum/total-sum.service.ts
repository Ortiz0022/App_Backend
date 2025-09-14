import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { TotalSum } from './entities/total-sum.entity';
import { FiscalYear } from '../fiscalYear/entities/fiscal-year.entity';
import { Income } from '../income/entities/income.entity';
import { Spend } from '../spend/entities/spend.entity';

@Injectable()
export class TotalSumService {
  constructor(
    @InjectRepository(TotalSum)  private readonly repo: Repository<TotalSum>,
    @InjectRepository(FiscalYear) private readonly fyRepo: Repository<FiscalYear>,
    @InjectRepository(Income)     private readonly incomeRepo: Repository<Income>,
    @InjectRepository(Spend)      private readonly spendRepo: Repository<Spend>,
  ) {}

  /** Calcula y persiste total_income y total_spend para el FY indicado (upsert). */
  async recalcForFiscalYear(fiscalYearId: number): Promise<TotalSum> {
    const fy = await this.fyRepo.findOne({ where: { id: fiscalYearId } });
    if (!fy) throw new NotFoundException('FiscalYear not found');

    // SUM ingresos en el rango del año fiscal
    const incRaw = await this.incomeRepo
      .createQueryBuilder('i')
      .where('i.date >= :start AND i.date <= :end', { start: fy.start_date, end: fy.end_date })
      .select('COALESCE(SUM(i.amount),0)', 'total')
      .getRawOne<{ total: string }>();
    const totalIncome = Number(incRaw?.total ?? 0).toFixed(2);

    // SUM egresos en el rango del año fiscal
    const spRaw = await this.spendRepo
      .createQueryBuilder('s')
      .where('s.date >= :start AND s.date <= :end', { start: fy.start_date, end: fy.end_date })
      .select('COALESCE(SUM(s.amount),0)', 'total')
      .getRawOne<{ total: string }>();
    const totalSpend = Number(spRaw?.total ?? 0).toFixed(2);

    // Upsert por FY
    let snap = await this.repo.findOne({ where: { fiscalYear: { id: fy.id } as any } });
    if (!snap) {
      snap = this.repo.create({
        fiscalYear: { id: fy.id } as any,
        total_income: '0.00',
        total_spend: '0.00',
      });
    }
    snap.total_income = totalIncome;
    snap.total_spend = totalSpend;

    await this.repo.save(snap);
    return this.findByFiscalYear(fy.id);
  }

  /** Devuelve el snapshot por año fiscal */
  findByFiscalYear(fiscalYearId: number): Promise<TotalSum> {
    return this.repo.findOne({
      where: { fiscalYear: { id: fiscalYearId } as any },
    }) as Promise<TotalSum>;
  }

  /** Lista todos los snapshots ordenados por FY (desc). */
  findAll(): Promise<TotalSum[]> {
    return this.repo.find({ order: { id: 'DESC' } });
  }
}
