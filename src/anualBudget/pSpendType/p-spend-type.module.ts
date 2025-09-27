import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PSpendType } from './entities/p-spend-type.entity';
import { PSpend } from '../pSpend/entities/p-spend.entity';
import { PSpendTypeService } from './p-spend-type.service';
import { PSpendTypeController } from './p-spend-type.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PSpendType, PSpend])],
  controllers: [PSpendTypeController],
  providers: [PSpendTypeService],
  exports: [PSpendTypeService],
})
export class PSpendTypeModule {}
