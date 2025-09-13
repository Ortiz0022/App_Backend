import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TotalSum } from './entities/total-sum.entity';
import { FiscalYear } from '../fiscalYear/entities/fiscal-year.entity';
import { Income } from '../income/entities/income.entity';
import { TotalSumService } from './total-sum.service';
import { TotalSumController } from './total-sum.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TotalSum, FiscalYear, Income])],
  controllers: [TotalSumController],
  providers: [TotalSumService],
  exports: [TypeOrmModule, TotalSumService],
})
export class TotalSumModule {}
