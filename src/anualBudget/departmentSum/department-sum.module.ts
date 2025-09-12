import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DepartmentSumController } from './department-sum.controller';
import { DepartmentSumService } from './department-sum.service';
import { DepartmentSum } from './entities/department-sum.entity';


@Module({
  imports: [TypeOrmModule.forFeature([DepartmentSum])],
  controllers: [DepartmentSumController],
  providers: [DepartmentSumService],
  exports: [DepartmentSumService],
})
export class DepartmentSumModule {}
