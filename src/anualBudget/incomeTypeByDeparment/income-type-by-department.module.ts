// src/anualBudget/incomeTypeByDeparment/income-type-by-department.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IncomeTypeByDepartment } from './entities/income-type-by-department.entity';
import { IncomeType } from 'src/anualBudget/incomeType/entities/income-type.entity';
import { IncomeTypeByDepartmentService } from './income-type-by-department.service';
import { IncomeTypeByDepartmentController } from './income-type-by-department.controller';

@Module({
  imports: [TypeOrmModule.forFeature([IncomeTypeByDepartment, IncomeType])],
  controllers: [IncomeTypeByDepartmentController],
  providers: [IncomeTypeByDepartmentService],
  exports: [IncomeTypeByDepartmentService], // 👈 necesario para inyectarlo en IncomeTypeService
})
export class IncomeTypeByDepartmentModule {}
