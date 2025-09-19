import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpendSubType } from './entities/spend-sub-type.entity';
import { SpendType } from '../spendType/entities/spend-type.entity';
import { Spend } from '../spend/entities/spend.entity';
import { SpendSubTypeService } from './spend-sub-type.service';
import { SpendTypeModule } from '../spendType/spend-type.module';
import { SpendSubTypeController } from './spend-sub-type.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([SpendSubType, SpendType, Spend]),
    SpendTypeModule, // porque SpendSubTypeService usa SpendTypeService
  ],
  controllers: [SpendSubTypeController],
  providers: [SpendSubTypeService],
  exports: [SpendSubTypeService], // ⬅️ NECESARIO
})
export class SpendSubTypeModule {}
