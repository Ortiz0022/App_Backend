import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IncomeSubType } from './entities/income-sub-type.entity';
import { IncomeSubTypeService } from './income-sub-type.service';
import { IncomeSubTypeController } from './income-sub-type.controller';
import { IncomeType } from '../incomeType/entities/income-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([IncomeSubType, IncomeType])],
  controllers: [IncomeSubTypeController],
  providers: [IncomeSubTypeService],
  exports: [IncomeSubTypeService],
})
export class IncomeSubTypeModule {}
