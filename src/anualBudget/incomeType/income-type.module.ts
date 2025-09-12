import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { IncomeType } from './entities/income-type.entity';
import { IncomeTypeService } from './income-type.service';       // <- FALTABA
import { IncomeTypeController } from './income-type.controller'; // <- FALTABA

import { FiscalYearModule } from '../fiscalYear/fiscal-year.module';
import { IncomeTypeByDepartmentModule } from '../incomeTypeByDeparment/income-type-by-department.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([IncomeType]),
    FiscalYearModule,
    IncomeTypeByDepartmentModule,
  ],
  controllers: [IncomeTypeController],
  providers: [IncomeTypeService],
  exports: [IncomeTypeService],
})
export class IncomeTypeModule {}
