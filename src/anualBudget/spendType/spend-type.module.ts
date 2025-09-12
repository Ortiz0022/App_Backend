// src/spendType/spend-type.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpendTypeService } from './spend-type.service';
import { SpendTypeController } from './spend-type.controller';
import { SpendType } from './entities/spend-type.entity';
import { SpendSubType } from '../spendSubType/entities/spend-sub-type.entity';
import { Department } from '../department/entities/department.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SpendType, SpendSubType, Department])],
  controllers: [SpendTypeController],
  providers: [SpendTypeService],
  exports: [SpendTypeService],
})
export class SpendTypeModule {}
