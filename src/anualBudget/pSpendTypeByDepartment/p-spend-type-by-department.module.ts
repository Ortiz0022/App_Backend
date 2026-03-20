import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PSpendTypeByDepartment } from './entities/p-spend-type-by-department.entity';
import { Department } from '../department/entities/department.entity';
import { PSpendTypeByDepartmentService } from './p-spend-type-by-department.service';
import { PSpendTypeByDepartmentController } from './p-spend-type-by-department.controller';
import { PSpend } from '../pSpend/entities/p-spend.entity';
import { FiscalYear } from '../fiscalYear/entities/fiscal-year.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PSpendTypeByDepartment, Department, PSpend, FiscalYear])],
  controllers: [PSpendTypeByDepartmentController],
  providers: [PSpendTypeByDepartmentService],
  exports: [TypeOrmModule],
})
export class PSpendTypeByDepartmentModule {}
