// src/anualBudget/extraordinary/extraordinary.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Extraordinary } from './entities/extraordinary.entity';

import { ExtraordinaryController } from './extraordinary.controller';
import { IncomeType } from '../incomeType/entities/income-type.entity';
import { IncomeSubType } from '../incomeSubType/entities/income-sub-type.entity';
import { Income } from '../income/entities/income.entity';
import { IncomeTypeModule } from '../incomeType/income-type.module';
import { IncomeSubTypeModule } from '../incomeSubType/income-sub-type.module';
import { ExtraordinaryService } from './extraordinary.service';
import { FiscalYearModule } from '../fiscalYear/fiscal-year.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Extraordinary, IncomeType, IncomeSubType, Income]),
    IncomeTypeModule,
    IncomeSubTypeModule, 
    FiscalYearModule,
  ],
  controllers: [ExtraordinaryController],
  providers: [ExtraordinaryService],
  exports: [ExtraordinaryService],
})
export class ExtraordinaryModule {}
