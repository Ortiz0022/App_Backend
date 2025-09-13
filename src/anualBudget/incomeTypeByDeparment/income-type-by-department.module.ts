// src/anualBudget/incomeTypeByDeparment/income-type-by-department.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IncomeTypeByDepartment } from './entities/income-type-by-department.entity';
import { IncomeTypeByDepartmentService } from './income-type-by-department.service';
import { IncomeTypeByDepartmentController } from './income-type-by-department.controller';
import { FiscalYear } from '../fiscalYear/entities/fiscal-year.entity';
import { Department } from '../department/entities/department.entity';
import { Income } from '../income/entities/income.entity';

@Module({
  imports: [TypeOrmModule.forFeature([IncomeTypeByDepartment, FiscalYear, Department, Income])],
  controllers: [IncomeTypeByDepartmentController], // 👈 aquí
  providers: [IncomeTypeByDepartmentService],
  exports: [TypeOrmModule, IncomeTypeByDepartmentService],
})
export class IncomeTypeByDepartmentModule {}
