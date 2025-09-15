// src/anualBudget/pTotalSum/p-total-sum.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PTotalSum } from './entities/p-total-sum.entity';
import { FiscalYear } from '../fiscalYear/entities/fiscal-year.entity';
import { PIncome } from '../pIncome/entities/pIncome.entity';
import { PSpend } from '../pSpend/entities/p-spend.entity';

@Injectable()
export class PTotalSumService {
  constructor(
    @InjectRepository(PTotalSum)  private readonly repo: Repository<PTotalSum>,
    @InjectRepository(FiscalYear) private readonly fyRepo: Repository<FiscalYear>,
    @InjectRepository(PIncome)    private readonly pIncomeRepo: Repository<PIncome>,
    @InjectRepository(PSpend)     private readonly pSpendRepo: Repository<PSpend>,
  ) {}

  /** Calcula y persiste total_p_income y total_p_spend para el FY indicado (upsert). */
  async recalcForFiscalYear(fiscalYearId: number): Promise<PTotalSum> {
    const fy = await this.fyRepo.findOne({ where: { id: fiscalYearId } });
    if (!fy) throw new NotFoundException('FiscalYear not found');

    // === PROYECCIÓN DE INGRESOS ===
    // Si tu PIncome tiene fiscalYearId, puedes filtrar igual que pSpend (descomenta el where).
    const incRaw = await this.pIncomeRepo
      .createQueryBuilder('pi')
      .select('COALESCE(SUM(pi.amount),0)', 'total')
      // .where('pi.fiscalYearId = :fy', { fy: fiscalYearId })
      .getRawOne<{ total: string }>();
    const totalPIncome = Number(incRaw?.total ?? 0).toFixed(2);

    // === PROYECCIÓN DE EGRESOS ===
    const spRaw = await this.pSpendRepo
      .createQueryBuilder('ps')
      .select('COALESCE(SUM(ps.amount),0)', 'total')
      .where('ps.fiscalYearId = :fy', { fy: fiscalYearId })
      .getRawOne<{ total: string }>();
    const totalPSpend = Number(spRaw?.total ?? 0).toFixed(2);

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
    snap.total_p_spend  = totalPSpend;

    await this.repo.save(snap);
    return this.findByFiscalYear(fy.id);
  }

  findByFiscalYear(fiscalYearId: number): Promise<PTotalSum> {
    return this.repo.findOne({ where: { fiscalYear: { id: fiscalYearId } as any } }) as Promise<PTotalSum>;
  }

  findAll(): Promise<PTotalSum[]> {
    return this.repo.find({ order: { id: 'DESC' } });
  }
}
