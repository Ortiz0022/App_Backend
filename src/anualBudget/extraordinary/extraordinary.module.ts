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

@Module({
  imports: [
    TypeOrmModule.forFeature([Extraordinary, IncomeType, IncomeSubType, Income]),
    IncomeTypeModule,
    IncomeSubTypeModule, // ⬅️ para resolver IncomeSubTypeService
  ],
  controllers: [ExtraordinaryController],
  providers: [ExtraordinaryService],
})
export class ExtraordinaryModule {}
