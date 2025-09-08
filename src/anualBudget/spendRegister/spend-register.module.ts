import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SpendRegisterService } from './spend-register.service';
import { SpendRegisterController } from './spend-register.controller';
import { Category } from '../category/entities/category.entity';
import { SpendRegister } from './entities/spendRegister.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SpendRegister, Category])],
  controllers: [SpendRegisterController],
  providers: [SpendRegisterService],
  exports: [SpendRegisterService],
})
export class SpendRegisterModule {}
