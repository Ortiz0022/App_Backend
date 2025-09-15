import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { PTotalSum } from './entities/p-total-sum.entity';
import { FiscalYear } from '../fiscalYear/entities/fiscal-year.entity';
import { PIncome } from '../pIncome/entities/pIncome.entity';

@Injectable()
export class PTotalSumService {
  constructor(
    @InjectRepository(PTotalSum)  private readonly repo: Repository<PTotalSum>,
    @InjectRepository(FiscalYear) private readonly fyRepo: Repository<FiscalYear>,
    @InjectRepository(PIncome)     private readonly pIncomeRepo: Repository<PIncome>,
    //@InjectRepository(PSpend)      private readonly pSpendRepo: Repository<Spend>,
  ) {}

  /** Calcula y persiste total_income y total_spend para el FY indicado (upsert). */
  async recalcForFiscalYear(fiscalYearId: number): Promise<PTotalSum> {
    const fy = await this.fyRepo.findOne({ where: { id: fiscalYearId } });
    if (!fy) throw new NotFoundException('FiscalYear not found');
    
    // Ensure dates are valid
    if (!fy.start_date || !fy.end_date) {
      throw new Error('Fiscal year dates are not properly set');
    }

    // SUM all projected incomes (without date filter since PIncome doesn't have a date field)
    const incRaw = await this.pIncomeRepo
      .createQueryBuilder('pi')
      .select('COALESCE(SUM(pi.amount),0)', 'total')
      .getRawOne<{ total: string }>();
    const totalPIncome = Number(incRaw?.total ?? 0).toFixed(2);

    // SUM egresos en el rango del año fiscal
    /*const spRaw = await this.spendRepo
      .createQueryBuilder('s')
      .where('s.date >= :start AND s.date <= :end', { start: fy.start_date, end: fy.end_date })
      .select('COALESCE(SUM(s.amount),0)', 'total')
      .getRawOne<{ total: string }>();
    const totalSpend = Number(spRaw?.total ?? 0).toFixed(2);*/

    // Upsert por FY
    let snap = await this.repo.findOne({ where: { fiscalYear: { id: fy.id } as any } });
    if (!snap) {
      snap = this.repo.create({
        fiscalYear: { id: fy.id } as any,
        total_p_income: '0.00',
        total_p_spend: '0.00',
      });
    }
    snap.total_p_income = totalPIncome;
    //snap.total_p_spend = totalPSpend;

    await this.repo.save(snap);
    return this.findByFiscalYear(fy.id);
  }

  /** Devuelve el snapshot por año fiscal */
  findByFiscalYear(fiscalYearId: number): Promise<PTotalSum> {
    return this.repo.findOne({
      where: { fiscalYear: { id: fiscalYearId } as any },
    }) as Promise<PTotalSum>;
  }

  /** Lista todos los snapshots ordenados por FY (desc). */
  findAll(): Promise<PTotalSum[]> {
    return this.repo.find({ order: { id: 'DESC' } });
  }
}
