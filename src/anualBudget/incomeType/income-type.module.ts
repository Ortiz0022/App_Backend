import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { IncomeType } from './entities/income-type.entity';
import { IncomeTypeService } from './income-type.service';
import { IncomeTypeController } from './income-type.controller';

import { IncomeSubType } from '../incomeSubType/entities/income-sub-type.entity';
import { IncomeTypeByDepartmentModule } from '../incomeTypeByDeparment/income-type-by-department.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([IncomeType, IncomeSubType]),
    IncomeTypeByDepartmentModule, // para inyectar IncomeTypeByDepartmentService
  ],
  controllers: [IncomeTypeController],
  providers: [IncomeTypeService],
  exports: [TypeOrmModule, IncomeTypeService],
})
export class IncomeTypeModule {}
