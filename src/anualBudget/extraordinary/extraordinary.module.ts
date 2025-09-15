// src/anualBudget/extraordinary/extraordinary.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Extraordinary } from './entities/extraordinary.entity';
import { ExtraordinaryService } from './extraordinary.service';
import { ExtraordinaryController } from './extraordinary.controller';
import { Income } from '../income/entities/income.entity';
import { IncomeType } from '../incomeType/entities/income-type.entity';
import { IncomeSubType } from '../incomeSubType/entities/income-sub-type.entity';
import { IncomeTypeModule } from '../incomeType/income-type.module';
// (si tienes allocation entity, inclúyela aquí también)

@Module({
  imports: [
    TypeOrmModule.forFeature([Extraordinary, Income, IncomeType, IncomeSubType]),
    IncomeTypeModule,                         // 👈 importa el módulo que EXPORTA el servicio
    // o: forwardRef(() => IncomeTypeModule),
  ],
  providers: [ExtraordinaryService],
  controllers: [ExtraordinaryController],
})
export class ExtraordinaryModule {}
