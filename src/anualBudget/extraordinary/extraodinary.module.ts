// src/anualBudget/extraordinary/extraordinary.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssignBudget } from '../assing/entities/assing.entity';
import { Category } from '../category/entities/category.entity';
import { ExtraordinaryService } from './extraordinary.service';
import { ExtraordinaryController } from './extraordinary.controller';
import { Extraordinary } from './entities/extraordinary.entity';
import { ProjectModule } from '../projection/projection.module';

@Module({
  imports: [TypeOrmModule.forFeature([Extraordinary, AssignBudget, Category]),
  ProjectModule
  ],
  providers: [ExtraordinaryService],
  controllers: [ExtraordinaryController],
  exports: [ExtraordinaryService],
})
export class ExtraordinaryModule {}
