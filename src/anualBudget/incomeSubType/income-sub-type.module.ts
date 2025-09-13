// src/anualBudget/incomeSubType/income-sub-type.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IncomeSubType } from './entities/income-sub-type.entity';
import { IncomeSubTypeService } from './income-sub-type.service';
import { IncomeSubTypeController } from './income-sub-type.controller';
import { IncomeType } from '../incomeType/entities/income-type.entity';
import { IncomeTypeModule } from '../incomeType/income-type.module';

@Module({
  imports: [TypeOrmModule.forFeature([IncomeSubType, IncomeType]), IncomeTypeModule],
  controllers: [IncomeSubTypeController],
  providers: [IncomeSubTypeService],
  exports: [TypeOrmModule, IncomeSubTypeService],
})
export class IncomeSubTypeModule {}
