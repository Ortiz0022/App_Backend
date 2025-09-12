import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IncomeTypeByDepartmentService } from './income-type-by-department.service';
import { IncomeTypeByDepartmentController } from './income-type-by-department.controller';
import { Department } from '../department/entities/department.entity';
import { IncomeType } from '../incomeType/entities/income-type.entity';
import { IncomeTypeByDepartment } from './entities/income-type-by-department.entity';


@Module({
  imports: [TypeOrmModule.forFeature([IncomeTypeByDepartment, Department, IncomeType])],
  controllers: [IncomeTypeByDepartmentController],
  providers: [IncomeTypeByDepartmentService],
  exports: [IncomeTypeByDepartmentService],
})
export class IncomeTypeByDepartmentModule {}
