import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { IncomeType } from './entities/income-type.entity';
import { IncomeSubType } from 'src/anualBudget/incomeSubType/entities/income-sub-type.entity';

import { IncomeTypeController } from './income-type.controller';
import { IncomeTypeService } from './income-type.service';
import { PIncomeType } from '../pIncomeType/entities/pincome-type.entity';
import { Income } from '../income/entities/income.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([IncomeType, IncomeSubType, PIncomeType, Income]),
  ],
  controllers: [IncomeTypeController],
  providers: [IncomeTypeService],
  exports: [IncomeTypeService], 
})
export class IncomeTypeModule {}
