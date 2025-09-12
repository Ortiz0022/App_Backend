// src/spendType/spend-type.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpendTypeService } from './spend-type.service';
import { SpendTypeController } from './spend-type.controller';
import { SpendType } from './entities/spend-type.entity';
import { SpendSubType } from '../spendSubType/entities/spend-sub-type.entity';


@Module({
  imports: [
    TypeOrmModule.forFeature([SpendType, SpendSubType]), // repos usados por SpendTypeService
  ],
  controllers: [SpendTypeController],
  providers: [SpendTypeService],
  exports: [SpendTypeService], // 👈 NECESARIO para que otros módulos lo inyecten
})
export class SpendTypeModule {}
