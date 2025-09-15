import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PSpend } from './entities/p-spend.entity';
import { PSpendSubType } from '../pSpendSubType/entities/p-spend-sub-type.entity';
import { FiscalYear } from '../fiscalYear/entities/fiscal-year.entity';

import { PSpendController } from './p-spend.controller';
import { PSpendService } from './p-spend.services';

@Module({
  imports: [TypeOrmModule.forFeature([PSpend, PSpendSubType, FiscalYear])],
  controllers: [PSpendController],
  providers: [PSpendService],
  exports: [TypeOrmModule],
})
export class PSpendModule {}
