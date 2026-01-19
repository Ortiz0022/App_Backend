import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IncomeSubType } from './entities/income-sub-type.entity';
import { Income } from '../income/entities/income.entity';
import { IncomeType } from '../incomeType/entities/income-type.entity';
import { IncomeSubTypeService } from './income-sub-type.service';
import { IncomeTypeModule } from '../incomeType/income-type.module';
import { IncomeSubTypeController } from './income-sub-type.controller';
import { PIncomeSubType } from '../pIncomeSubType/entities/pincome-sub-type.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([IncomeSubType, IncomeType, Income, PIncomeSubType]),
    IncomeTypeModule, 
  ],
  controllers: [IncomeSubTypeController],
  providers: [IncomeSubTypeService],
  exports: [IncomeSubTypeService], 
})
export class IncomeSubTypeModule {}
