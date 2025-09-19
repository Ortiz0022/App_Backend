import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PSpendSubType } from './entities/p-spend-sub-type.entity';
import { PSpendType } from '../pSpendType/entities/p-spend-type.entity';
import { PSpendSubTypeService } from './p-spend-sub-type.service';
import { PSpendSubTypeController } from './p-spend-sub-type.controller';
import { PSpend } from '../pSpend/entities/p-spend.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PSpendSubType, PSpendType, PSpend])],
  controllers: [PSpendSubTypeController],
  providers: [PSpendSubTypeService],
  exports: [TypeOrmModule],
})
export class PSpendSubTypeModule {}
