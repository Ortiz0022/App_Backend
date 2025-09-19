import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';

import { Department } from '../department/entities/department.entity';

// INCOME
import { Income } from '../income/entities/income.entity';
import { IncomeSubType } from '../incomeSubType/entities/income-sub-type.entity';
import { IncomeType } from '../incomeType/entities/income-type.entity';

// SPEND
import { Spend } from '../spend/entities/spend.entity';
import { SpendSubType } from '../spendSubType/entities/spend-sub-type.entity';
import { SpendType } from '../spendType/entities/spend-type.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Department,
      Income, IncomeSubType, IncomeType,
      Spend, SpendSubType, SpendType,
    ]),
  ],
  controllers: [ReportController],
  providers: [ReportService],
})
export class ReportModule {}
