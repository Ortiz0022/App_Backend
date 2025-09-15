// src/anualBudget/pTotalSum/p-total-sum.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PTotalSum } from './entities/p-total-sum.entity';
import { PTotalSumService } from './p-total-sum.service';
import { PTotalSumController } from './p-total-sum.controller';
import { FiscalYear } from '../fiscalYear/entities/fiscal-year.entity';
import { PIncome } from '../pIncome/entities/pIncome.entity';
import { PSpend } from '../pSpend/entities/p-spend.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PTotalSum, FiscalYear, PIncome, PSpend])],
  controllers: [PTotalSumController],
  providers: [PTotalSumService],
  exports: [TypeOrmModule, PTotalSumService],
})
export class PTotalSumModule {}
