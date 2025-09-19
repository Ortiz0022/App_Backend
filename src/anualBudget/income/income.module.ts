import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Income } from './entities/income.entity';
import { IncomeSubType } from 'src/anualBudget/incomeSubType/entities/income-sub-type.entity';

import { IncomeController } from './income.controller';
import { IncomeService } from './income.service';

import { IncomeTypeModule } from 'src/anualBudget/incomeType/income-type.module';
import { IncomeSubTypeModule } from 'src/anualBudget/incomeSubType/income-sub-type.module';
import { FiscalYearModule } from 'src/anualBudget/fiscalYear/fiscal-year.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Income, IncomeSubType]),
    forwardRef(() => IncomeTypeModule),
    forwardRef(() => IncomeSubTypeModule),
    FiscalYearModule, // assertOpenByDate()
  ],
  controllers: [IncomeController],
  providers: [IncomeService],
  exports: [IncomeService], // opcional: por si otro módulo lo necesita
})
export class IncomeModule {}
