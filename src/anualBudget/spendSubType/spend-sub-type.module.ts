import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpendSubType } from './entities/spend-sub-type.entity';
import { SpendSubTypeService } from './spend-sub-type.service';
import { SpendSubTypeController } from './spend-sub-type.controller';
import { SpendType } from '../spendType/entities/spend-type.entity';
import { SpendTypeModule } from '../spendType/spend-type.module';

@Module({
  imports: [TypeOrmModule.forFeature([SpendSubType, SpendType]), SpendTypeModule],
  controllers: [SpendSubTypeController],
  providers: [SpendSubTypeService],
  exports: [TypeOrmModule, SpendSubTypeService],
})
export class SpendSubTypeModule {}
