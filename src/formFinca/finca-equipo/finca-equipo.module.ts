import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FincaEquipoService } from './finca-equipo.service';
import { FincaEquipoController } from './finca-equipo.controller';
import { FincaEquipo } from './entities/finca-equipo.entity';
import { Equipo } from 'src/formFinca/equipo/entities/equipo.entity';
import { Finca } from '../finca/entities/finca.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FincaEquipo, Finca, Equipo])],
  controllers: [FincaEquipoController],
  providers: [FincaEquipoService],
  exports: [FincaEquipoService],
})
export class FincaEquipoModule {}