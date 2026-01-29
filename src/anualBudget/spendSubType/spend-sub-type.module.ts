import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpendSubType } from './entities/spend-sub-type.entity';
import { SpendType } from '../spendType/entities/spend-type.entity';
import { Spend } from '../spend/entities/spend.entity';
import { SpendSubTypeService } from './spend-sub-type.service';
import { SpendTypeModule } from '../spendType/spend-type.module';
import { SpendSubTypeController } from './spend-sub-type.controller';
import { PSpendSubType } from '../pSpendSubType/entities/p-spend-sub-type.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SpendSubType, SpendType, Spend, PSpendSubType,]),
    SpendTypeModule, // porque SpendSubTypeService usa SpendTypeService
  ],
  controllers: [SpendSubTypeController],
  providers: [SpendSubTypeService],
  exports: [SpendSubTypeService], 
})
export class SpendSubTypeModule {}
