// src/anualBudget/incomeTypeByDeparment/income-type-by-department.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PIncomeTypeByDepartmentService } from './p-income-type-by-department.service';
import { PIncomeTypeByDepartmentController } from './p-income-type-by-department.controller';
import { FiscalYear } from '../fiscalYear/entities/fiscal-year.entity';
import { Department } from '../department/entities/department.entity';
import { PIncome } from '../pIncome/entities/pIncome.entity';
import { PIncomeTypeByDepartment } from './entities/p-income-type-by-deparment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PIncomeTypeByDepartment, FiscalYear, Department, PIncome])],
  controllers: [PIncomeTypeByDepartmentController], // 👈 aquí
  providers: [PIncomeTypeByDepartmentService],
  exports: [TypeOrmModule, PIncomeTypeByDepartmentService],
})
export class PIncomeTypeByDepartmentModule {}
