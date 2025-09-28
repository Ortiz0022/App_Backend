import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TotalSum } from './entities/total-sum.entity';
import { TotalSumService } from './total-sum.service';
import { TotalSumController } from './total-sum.controller';
import { FiscalYear } from '../fiscalYear/entities/fiscal-year.entity';
import { Income } from '../income/entities/income.entity';
import { Spend } from '../spend/entities/spend.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TotalSum,
      FiscalYear,
      Income,
      Spend,
    ]),
  ],
  controllers: [TotalSumController],
  providers: [TotalSumService],
  exports: [TotalSumService],
})
export class TotalSumModule {}
