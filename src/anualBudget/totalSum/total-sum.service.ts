// src/anualBudget/totalSum/total-sum.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TotalSum } from './entities/total-sum.entity';
import { FiscalYear } from 'src/anualBudget/fiscalYear/entities/fiscal-year.entity';
import { Income } from 'src/anualBudget/income/entities/income.entity';

@Injectable()
export class TotalSumService {
  constructor(
    @InjectRepository(TotalSum) private readonly repo: Repository<TotalSum>,
    @InjectRepository(FiscalYear) private readonly fyRepo: Repository<FiscalYear>,
    @InjectRepository(Income) private readonly incRepo: Repository<Income>,
  ) {}

  /** recalcula el total de ingresos de un año fiscal */
  async recalc(fiscalYearId: number) {
    const fy = await this.fyRepo.findOne({ where: { id: fiscalYearId } });
    if (!fy) throw new NotFoundException('FiscalYear not found');

    // 👇 aquí va exactamente ese query
    const raw = await this.incRepo
      .createQueryBuilder('i')
      .where('i.date >= :start AND i.date <= :end', {
        start: fy.start_date,
        end: fy.end_date,
      })
      .select('COALESCE(SUM(i.amount),0)', 'total')
      .getRawOne<{ total: string }>();

    const totalIncome = Number(raw?.total ?? 0).toFixed(2);

    let snapshot = await this.repo.findOne({
      where: { fiscalYear: { id: fy.id } } as any,
    });
    if (!snapshot) {
      snapshot = this.repo.create({ fiscalYear: fy, total_income: totalIncome });
    } else {
      snapshot.total_income = totalIncome;
    }

    return this.repo.save(snapshot);
  }

  findAll() {
    return this.repo.find({ relations: ['fiscalYear'], order: { id: 'ASC' } });
  }

  findOneByFiscalYear(fiscalYearId: number) {
    return this.repo.findOne({
      where: { fiscalYear: { id: fiscalYearId } } as any,
      relations: ['fiscalYear'],
    });
  }
}
