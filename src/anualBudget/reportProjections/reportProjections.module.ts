import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportProjectionsController } from './reportProjections.controller';
import { ReportProjectionsService } from './reportProjections.service';

import { Department } from '../department/entities/department.entity';

// reales
import { Income } from '../income/entities/income.entity';
import { IncomeSubType } from '../incomeSubType/entities/income-sub-type.entity';
import { IncomeType } from '../incomeType/entities/income-type.entity';
import { Spend } from '../spend/entities/spend.entity';
import { SpendSubType } from '../spendSubType/entities/spend-sub-type.entity';
import { SpendType } from '../spendType/entities/spend-type.entity';

// proyecciones
import { PIncome } from '../pIncome/entities/pIncome.entity';
import { PIncomeSubType } from '../pIncomeSubType/entities/pincome-sub-type.entity';
import { PIncomeType } from '../pIncomeType/entities/pincome-type.entity';
import { PSpend } from '../pSpend/entities/p-spend.entity';
import { PSpendSubType } from '../pSpendSubType/entities/p-spend-sub-type.entity';
import { PSpendType } from '../pSpendType/entities/p-spend-type.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Department,
      Income, IncomeSubType, IncomeType,
      Spend, SpendSubType, SpendType,
      PIncome, PIncomeSubType, PIncomeType,
      PSpend, PSpendSubType, PSpendType,
    ]),
  ],
  controllers: [ReportProjectionsController],
  providers: [ReportProjectionsService],
})
export class ReportProjectionsModule {}
