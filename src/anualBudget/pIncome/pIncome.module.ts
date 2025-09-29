import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PIncome } from './entities/pIncome.entity';
import { PIncomeSubType } from '../pIncomeSubType/entities/pincome-sub-type.entity';
import { PIncomeType } from '../pIncomeType/entities/pincome-type.entity';
import { PIncomeService } from './pIncome.service';
import { PIncomeController } from './pIncome.controller';
import { PIncomeTypeModule } from '../pIncomeType/pincome-type.module'; // 👈 para traer el service
import { FiscalYearModule } from '../fiscalYear/fiscal-year.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PIncome, PIncomeSubType, PIncomeType]),
    PIncomeTypeModule,
    FiscalYearModule,
  ],
  controllers: [PIncomeController],
  providers: [PIncomeService],
  exports: [TypeOrmModule, PIncomeService],
})
export class PIncomeModule {}
