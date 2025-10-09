import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Finca } from '../finca/entities/finca.entity';
import { FincaOtroEquipo } from './entities/finca-equipo.entity';
import { FincaOtroEquipoController } from './finca-equipo.controller';
import { FincaOtroEquipoService } from './finca-otro-equipo.service';

@Module({
  imports: [TypeOrmModule.forFeature([FincaOtroEquipo, Finca])],
  controllers: [FincaOtroEquipoController],
  providers: [FincaOtroEquipoService],
  exports: [FincaOtroEquipoService],
})
export class FincaOtroEquipoModule {}