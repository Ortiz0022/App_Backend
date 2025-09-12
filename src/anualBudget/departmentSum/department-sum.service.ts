// src/anualBudget/departmentSum/department-sum.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DepartmentSum } from './entities/department-sum.entity';

@Injectable()
export class DepartmentSumService {
  constructor(
    @InjectRepository(DepartmentSum)
    private readonly repo: Repository<DepartmentSum>,
  ) {}

  // Suma total por año fiscal (across all departments)
  async getGrandIncome(fiscalYearId: number) {
    if (!Number.isFinite(fiscalYearId)) {
      throw new BadRequestException('fiscalYearId must be a number');
    }

    // Si tu entity NO define columnas FK explícitas, TypeORM crea "fiscalYearId" por convención.
    // Si definiste @JoinColumn({ name: 'fiscalYearId' }) aún mejor.
    const row = await this.repo
      .createQueryBuilder('ds')
      .select('COALESCE(SUM(ds.totalIncome), 0)', 'total')
      .where('ds.fiscalYearId = :fy', { fy: fiscalYearId })
      .getRawOne<{ total: string }>(); // puede ser undefined si no hay filas

    const total = row?.total ?? '0'; // DECIMAL como string
    return { fiscalYearId, total };
  }
}
