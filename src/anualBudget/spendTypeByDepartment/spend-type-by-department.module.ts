import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpendTypeByDepartment } from './entities/spend-type-by-department.entity';
import { SpendTypeByDepartmentService } from './spend-type-by-department.service';
import { SpendTypeByDepartmentController } from './spend-type-by-department.controller';
import { FiscalYear } from '../fiscalYear/entities/fiscal-year.entity';
import { Department } from '../department/entities/department.entity';
import { Spend } from '../spend/entities/spend.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SpendTypeByDepartment, FiscalYear, Department, Spend])],
  controllers: [SpendTypeByDepartmentController],
  providers: [SpendTypeByDepartmentService],
  exports: [TypeOrmModule, SpendTypeByDepartmentService],
})
export class SpendTypeByDepartmentModule {}
