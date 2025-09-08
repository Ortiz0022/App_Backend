import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectService } from './project.service';
import { ProjectionController } from './projection.controller';
import { Projection } from './entities/projection.entity';
import { Category } from '../category/entities/category.entity';


@Module({
  imports: [TypeOrmModule.forFeature([Projection, Category])],
  controllers: [ProjectionController],
  providers: [ProjectService],
  exports: [ProjectService],
})
export class ProjectModule {}
