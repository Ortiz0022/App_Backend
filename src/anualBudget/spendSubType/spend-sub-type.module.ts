// src/spendSubType/spend-subtype.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpendSubTypeService } from './spend-sub-type.service';
import { SpendType } from '../spendType/entities/spend-type.entity';
import { SpendTypeModule } from '../spendType/spend-type.module';
import { SpendSubType } from './entities/spend-sub-type.entity';
import { SpendSubTypeController } from './spend-sub-type.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([SpendSubType, SpendType]), // repos que usa este módulo
    SpendTypeModule,                                     // 👈 trae y habilita SpendTypeService
  ],
  controllers: [SpendSubTypeController],
  providers: [SpendSubTypeService],
})
export class SpendSubTypeModule {}
