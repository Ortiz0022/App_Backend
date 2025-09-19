import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Transfer } from './entities/transfer.entity';
import { TransferService } from './transfer.service';
import { TransferController } from './transfer.controller';

import { IncomeSubType } from 'src/anualBudget/incomeSubType/entities/income-sub-type.entity';
import { SpendSubType } from 'src/anualBudget/spendSubType/entities/spend-sub-type.entity';
import { Spend } from 'src/anualBudget/spend/entities/spend.entity';

// Importa los MÓDULOS que exportan sus services
import { IncomeSubTypeModule } from 'src/anualBudget/incomeSubType/income-sub-type.module';
import { SpendSubTypeModule } from 'src/anualBudget/spendSubType/spend-sub-type.module';
import { FiscalYearModule } from 'src/anualBudget/fiscalYear/fiscal-year.module';

@Module({
  imports: [
    // Repos que usa DIRECTAMENTE TransferService por @InjectRepository(...)
    TypeOrmModule.forFeature([Transfer, IncomeSubType, SpendSubType, Spend]),

    // Services externos que inyecta TransferService, traídos por sus módulos:
    IncomeSubTypeModule,
    SpendSubTypeModule,
    FiscalYearModule,
  ],
  controllers: [TransferController],
  providers: [TransferService],
  exports: [TransferService],
})
export class TransferModule {}
