import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Department } from '../department/entities/department.entity';
import { Income } from '../income/entities/income.entity';
import { Spend } from '../spend/entities/spend.entity';
import { IncomeType } from '../incomeType/entities/income-type.entity';
import { IncomeSubType } from '../incomeSubType/entities/income-sub-type.entity';
import { SpendType } from '../spendType/entities/spend-type.entity';
import { SpendSubType } from '../spendSubType/entities/spend-sub-type.entity';
import { PIncome } from '../pIncome/entities/pIncome.entity';
import { HomeController } from './home.controller';
import { HomeService } from './home.service';
import { PSpend } from '../pSpend/entities/p-spend.entity';
import { Transfer } from '../transfer/entities/transfer.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Department,
      Income, PIncome,
      Spend, PSpend,
      IncomeType, IncomeSubType,
      SpendType, SpendSubType,
      Transfer, // ⬅️ NUEVO
    ]),
  ],
  controllers: [HomeController],
  providers: [HomeService],
  exports: [HomeService],
})
export class HomeModule {}
