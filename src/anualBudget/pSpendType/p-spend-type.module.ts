// src/anualBudget/pSpendType/p-spend-type.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PSpendType } from './entities/p-spend-type.entity';
import { Department } from '../department/entities/department.entity';
import { PSpendTypeService } from './p-spend-type.service';
import { PSpendTypeController } from './p-spend-type.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PSpendType, Department])],
  controllers: [PSpendTypeController],
  providers: [PSpendTypeService],
  exports: [TypeOrmModule],
})
export class PSpendTypeModule {}
