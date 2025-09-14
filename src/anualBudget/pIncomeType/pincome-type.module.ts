import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PIncomeType } from './entities/pincome-type.entity';
import { PIncomeTypeService } from './pincome-type.service';
import { PIncomeTypeController } from './pincome-type.controller';

import { PIncomeSubType } from '../pIncomeSubType/entities/pincome-sub-type.entity';
import { PIncome } from '../pIncome/entities/pIncome.entity';
import { Department } from '../department/entities/department.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PIncomeType, PIncomeSubType, PIncome, Department]),
  ],
  controllers: [PIncomeTypeController],
  providers: [PIncomeTypeService],
  exports: [TypeOrmModule, PIncomeTypeService],
})
export class PIncomeTypeModule {}
