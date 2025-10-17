import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AreasInteresService } from './areas-interes.service';
import { AreasInteresController } from './areas-interes.controller';
import { AreaInteres } from './entities/areas-interes.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AreaInteres])],
  controllers: [AreasInteresController],
  providers: [AreasInteresService],
  exports: [AreasInteresService, TypeOrmModule],
})
export class AreasInteresModule {}