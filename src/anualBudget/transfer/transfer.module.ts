// src/transfer/transfer.module.ts
import { IncomeTypeService } from 'src/anualBudget/incomeType/income-type.service';
import { IncomeType } from 'src/anualBudget/incomeType/entities/income-type.entity';
import { IncomeSubType } from 'src/anualBudget/incomeSubType/entities/income-sub-type.entity';
import { Income } from 'src/anualBudget/income/entities/income.entity';
import { TransferService } from './transfer.service';
import { Transfer } from './entities/transfer.entity';
import { Spend } from 'src/anualBudget/spend/entities/spend.entity';
import { SpendSubType } from 'src/anualBudget/spendSubType/entities/spend-sub-type.entity';
import { SpendType } from 'src/anualBudget/spendType/entities/spend-type.entity';
import { FiscalYear } from 'src/anualBudget/fiscalYear/entities/fiscal-year.entity';
import { TransferController } from './transfer.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { FiscalYearService } from '../fiscalYear/fiscal-year.service';
import { SpendTypeService } from '../spendType/spend-type.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Transfer,
      // para balance y recalculo
      Income, IncomeSubType, IncomeType,
      Spend, SpendSubType, SpendType, FiscalYear,
    ]),
  ],
  controllers: [TransferController],
  providers: [
    TransferService,
    SpendTypeService,
    FiscalYearService,
    IncomeTypeService,
  ],
  exports: [TransferService],
})
export class TransferModule {}
