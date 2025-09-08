import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectService } from './project.service';
import { ProjectionController } from './projection.controller';
import { Projection } from './entities/projection.entity';
import { Category } from '../category/entities/category.entity';
import { FiscalYear } from '../fiscalYear/entities/fiscal-year.entity';


@Module({
  imports: [TypeOrmModule.forFeature([Projection, Category, FiscalYear])],
  controllers: [ProjectionController],
  providers: [ProjectService],
  exports: [ProjectService],
})
export class ProjectModule {}
