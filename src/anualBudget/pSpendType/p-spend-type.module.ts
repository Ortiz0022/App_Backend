// src/anualBudget/pSpendType/p-spend-type.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PSpendType } from './entities/p-spend-type.entity';
import { PSpendTypeController } from './p-spend-type.controller';
import { PSpendTypeService } from './p-spend-type.service';
import { PSpend } from '../pSpend/entities/p-spend.entity';
import { Department } from '../department/entities/department.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PSpendType, PSpend, Department])],
  controllers: [PSpendTypeController],
  providers: [PSpendTypeService],
  exports: [TypeOrmModule, PSpendTypeService],
})
export class PSpendTypeModule {}
