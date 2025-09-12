import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IncomeSubType } from './entities/income-sub-type.entity';
import { IncomeSubTypeService } from './income-sub-type.service';
import { IncomeSubTypeController } from './income-sub-type.controller';
import { IncomeType } from '../incomeType/entities/income-type.entity';
import { IncomeTypeByDepartmentModule } from '../incomeTypeByDeparment/income-type-by-department.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([IncomeSubType, IncomeType]),
    IncomeTypeByDepartmentModule, // 👈 para inyectar el service de totales por depto
  ],
  controllers: [IncomeSubTypeController],
  providers: [IncomeSubTypeService],
  exports: [IncomeSubTypeService],
})
export class IncomeSubTypeModule {}
