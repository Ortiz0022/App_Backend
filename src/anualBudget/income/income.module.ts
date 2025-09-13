// src/anualBudget/income/income.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Income } from './entities/income.entity';
import { IncomeService } from './income.service';
import { IncomeController } from './income.controller';
import { IncomeSubType } from '../incomeSubType/entities/income-sub-type.entity';
import { IncomeTypeModule } from '../incomeType/income-type.module';
import { FiscalYearModule } from '../fiscalYear/fiscal-year.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Income, IncomeSubType]),
    IncomeTypeModule,   // para inyectar IncomeTypeService
    FiscalYearModule,   // para validar FY por fecha
  ],
  controllers: [IncomeController],
  providers: [IncomeService],
  exports: [TypeOrmModule, IncomeService],
})
export class IncomeModule {}
