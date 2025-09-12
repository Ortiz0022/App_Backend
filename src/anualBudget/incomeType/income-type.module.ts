import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { IncomeType } from './entities/income-type.entity';
import { IncomeSubType } from 'src/anualBudget/incomeSubType/entities/income-sub-type.entity';
import { Department } from 'src/anualBudget/department/entities/department.entity';
import { IncomeTypeService } from './income-type.service';
import { IncomeTypeController } from './income-type.controller';

import { IncomeTypeByDepartmentModule } from '../incomeTypeByDeparment/income-type-by-department.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([IncomeType, IncomeSubType, Department]),
    IncomeTypeByDepartmentModule, // debe exportar el service
  ],
  controllers: [IncomeTypeController],
  providers: [IncomeTypeService],
  exports: [IncomeTypeService],
})
export class IncomeTypeModule {}

