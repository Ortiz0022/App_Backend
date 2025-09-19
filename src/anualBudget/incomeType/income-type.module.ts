import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { IncomeType } from './entities/income-type.entity';
import { IncomeSubType } from 'src/anualBudget/incomeSubType/entities/income-sub-type.entity';

import { IncomeTypeController } from './income-type.controller';
import { IncomeTypeService } from './income-type.service';

@Module({
  imports: [
    // Usa ambos repos porque el service suma desde IncomeSubType
    TypeOrmModule.forFeature([IncomeType, IncomeSubType]),
  ],
  controllers: [IncomeTypeController],
  providers: [IncomeTypeService],
  exports: [IncomeTypeService], // para que otros módulos (Income, IncomeSubType) lo inyecten
})
export class IncomeTypeModule {}
