import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpendType } from './entities/spend-type.entity';
import { SpendTypeService } from './spend-type.service';
import { SpendTypeController } from './spend-type.controller';
import { SpendSubType } from 'src/anualBudget/spendSubType/entities/spend-sub-type.entity';
import { Spend } from 'src/anualBudget/spend/entities/spend.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SpendType, SpendSubType, Spend])],
  controllers: [SpendTypeController],
  providers: [SpendTypeService],
  exports: [TypeOrmModule, SpendTypeService],
})
export class SpendTypeModule {}
