import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Extraordinary } from './entities/extraordinary.entity';

import { ExtraordinaryController } from './extraordinary.controller';
import { ExtraordinaryService } from './extraordinary.service';

// ➕ estos módulos proveen los servicios/repos que usa ExtraordinaryService
import { IncomeType } from 'src/anualBudget/incomeType/entities/income-type.entity';
import { IncomeSubType } from 'src/anualBudget/incomeSubType/entities/income-sub-type.entity';
import { Income } from 'src/anualBudget/income/entities/income.entity';

import { IncomeTypeModule } from 'src/anualBudget/incomeType/income-type.module';
import { IncomeSubTypeModule } from 'src/anualBudget/incomeSubType/income-sub-type.module';

@Module({
  imports: [
    // repos usados dentro de ExtraordinaryService (InjectRepository)
    TypeOrmModule.forFeature([Extraordinary, IncomeType, IncomeSubType, Income]),
    // ⬇️ IMPORTANTE: para que Nest tenga disponibles los providers que inyectas
    IncomeTypeModule,
    IncomeSubTypeModule,
  ],
  controllers: [ExtraordinaryController],
  providers: [ExtraordinaryService],
  exports: [ExtraordinaryService],
})
export class ExtraordinaryModule {}
