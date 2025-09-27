// src/anualBudget/pSpendSubType/p-spend-sub-type.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PSpendSubType } from './entities/p-spend-sub-type.entity';
import { PSpend } from '../pSpend/entities/p-spend.entity';
import { PSpendSubTypeService } from './p-spend-sub-type.service';
import { PSpendSubTypeController } from './p-spend-sub-type.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([PSpendSubType, PSpend]), // <- IMPORTANTE
  ],
  controllers: [PSpendSubTypeController],
  providers: [PSpendSubTypeService],
  exports: [PSpendSubTypeService],
})
export class PSpendSubTypeModule {}
