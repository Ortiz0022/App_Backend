import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PIncomeSubType } from './entities/pincome-sub-type.entity';
import { PIncomeSubTypeService } from './pincome-sub-type.service';
import { PIncomeSubTypeController } from './pincome-sub-type.controller';
import { PIncomeType } from '../pIncomeType/entities/pincome-type.entity';
import { PIncomeTypeModule } from '../pIncomeType/pincome-type.module';
import { PIncome } from '../pIncome/entities/pIncome.entity';

@Module({
  // Registrar TAMBIÉN PIncomeType para que TypeORM tenga la metadata
  imports: [TypeOrmModule.forFeature([PIncomeSubType, PIncomeType, PIncome]),
  PIncomeTypeModule],
  controllers: [PIncomeSubTypeController],
  providers: [PIncomeSubTypeService],
  exports: [TypeOrmModule, PIncomeSubTypeService],
})
export class PIncomeSubTypeModule {}
