// src/anualBudget/spendTypeByDepartment/spend-type-by-department.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpendTypeByDepartment } from './entities/spend-type-by-department.entity';
import { SpendType } from 'src/anualBudget/spendType/entities/spend-type.entity';
import { Department } from 'src/anualBudget/department/entities/department.entity';
import { SpendTypeByDepartmentService } from './spend-type-by-department.service';
import { SpendTypeByDepartmentController } from './spend-type-by-department.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SpendTypeByDepartment, SpendType, Department])],
  providers: [SpendTypeByDepartmentService],
  controllers: [SpendTypeByDepartmentController],
  exports: [SpendTypeByDepartmentService],
})
export class SpendTypeByDepartmentModule {}
