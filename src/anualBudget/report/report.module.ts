import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';
import { Department } from '../department/entities/department.entity';
import { Income } from '../income/entities/income.entity';
import { IncomeSubType } from '../incomeSubType/entities/income-sub-type.entity';
import { IncomeType } from '../incomeType/entities/income-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Income, IncomeSubType, IncomeType, Department])],
  controllers: [ReportController],
  providers: [ReportService],
})
export class ReportModule {}
