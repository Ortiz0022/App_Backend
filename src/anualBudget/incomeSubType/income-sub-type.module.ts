import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { IncomeSubType } from './entities/income-sub-type.entity';
import { Income } from 'src/anualBudget/income/entities/income.entity';
import { IncomeType } from 'src/anualBudget/incomeType/entities/income-type.entity';

import { IncomeSubTypeController } from './income-sub-type.controller';
import { IncomeSubTypeService } from './income-sub-type.service';
import { IncomeTypeModule } from 'src/anualBudget/incomeType/income-type.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([IncomeSubType, Income, IncomeType]),
    // Evita ciclo: este módulo necesita IncomeTypeService
    forwardRef(() => IncomeTypeModule),
  ],
  controllers: [IncomeSubTypeController],
  providers: [IncomeSubTypeService],
  exports: [IncomeSubTypeService], // para que IncomeModule pueda inyectarlo
})
export class IncomeSubTypeModule {}
