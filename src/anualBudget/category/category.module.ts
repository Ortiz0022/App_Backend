import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';

import { Category } from './entities/category.entity';
import { Budget } from '../budget/entities/budget.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Category, Budget])],
  controllers: [CategoryController],
  providers: [CategoryService],
  exports: [CategoryService],
})
export class CategoryModule {}
