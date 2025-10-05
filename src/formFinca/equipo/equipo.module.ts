import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EquipoService } from './equipo.service';
import { EquipoController } from './equipo.controller';
import { Equipo } from './entities/equipo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Equipo])],
  controllers: [EquipoController],
  providers: [EquipoService],
  exports: [EquipoService],
})
export class EquipoModule {}