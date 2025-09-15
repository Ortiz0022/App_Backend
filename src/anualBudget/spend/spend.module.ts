import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Spend } from './entities/spend.entity';
import { SpendService } from './spend.service';
import { SpendController } from './spend.controller';
import { SpendSubType } from '../spendSubType/entities/spend-sub-type.entity';
import { SpendTypeModule } from '../spendType/spend-type.module';
import { FiscalYearModule } from '../fiscalYear/fiscal-year.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Spend, SpendSubType]),
    SpendTypeModule,   // para inyectar SpendTypeService
    FiscalYearModule,  // para validar FY por fecha
  ],
  controllers: [SpendController],
  providers: [SpendService],
  exports: [TypeOrmModule, SpendService],
})
export class SpendModule {}
