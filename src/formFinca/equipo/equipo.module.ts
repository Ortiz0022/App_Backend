import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Finca } from '../finca/entities/finca.entity';
import { InfraestructuraProduccion } from './entities/equipo.entity';
import { InfraestructuraProduccionController } from './equipo.controller';
import { InfraestructuraProduccionService } from './equipo.service';

@Module({
  imports: [TypeOrmModule.forFeature([InfraestructuraProduccion, Finca])],
  controllers: [InfraestructuraProduccionController],
  providers: [InfraestructuraProduccionService],
  exports: [InfraestructuraProduccionService],
})
export class InfraestructuraProduccionModule {}