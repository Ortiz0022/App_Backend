// src/anualBudget/departmentSum/department-sum.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DepartmentSum } from './entities/department-sum.entity';
import { DepartmentSumService } from './department-sum.service';
import { DepartmentSumController } from './department-sum.controller';
import { FiscalYear } from 'src/anualBudget/fiscalYear/entities/fiscal-year.entity';
import { SpendTypeByDepartment } from 'src/anualBudget/spendTypeByDepartment/entities/spend-type-by-department.entity';
import { IncomeTypeByDepartment } from 'src/anualBudget/incomeTypeByDeparment/entities/income-type-by-department.entity'; // 👈 NUEVO

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DepartmentSum,
      FiscalYear,
      SpendTypeByDepartment,
      IncomeTypeByDepartment, // 👈 NUEVO
    ]),
  ],
  providers: [DepartmentSumService],
  controllers: [DepartmentSumController],
})
export class DepartmentSumModule {}
