// src/transfer/transfer.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transfer } from './entities/transfer.entity';
import { TransferService } from './transfer.service';
import { TransferController } from './transfer.controller';
import { SpendType } from '../spendType/entities/spend-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Transfer, SpendType])],
  controllers: [TransferController],
  providers: [TransferService],
  exports: [TransferService],
})
export class TransferModule {}
