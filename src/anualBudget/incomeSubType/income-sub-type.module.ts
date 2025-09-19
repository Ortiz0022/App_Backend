// src/anualBudget/incomeSubType/income-sub-type.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IncomeSubType } from './entities/income-sub-type.entity';
import { Income } from '../income/entities/income.entity';
import { IncomeType } from '../incomeType/entities/income-type.entity';
import { IncomeSubTypeService } from './income-sub-type.service';
import { IncomeTypeModule } from '../incomeType/income-type.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([IncomeSubType, IncomeType, Income]),
    IncomeTypeModule, // porque el service usa IncomeTypeService
  ],
  providers: [IncomeSubTypeService],
  exports: [IncomeSubTypeService], // ⬅️ importante
})
export class IncomeSubTypeModule {}
