import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FincaFuenteEnergiaService } from './finca-fuente-energia.service';
import { FincaFuenteEnergiaController } from './finca-fuente-energia.controller';
import { FincaFuenteEnergia } from './entities/finca-fuente-energia.entity';
import { Finca } from '../finca/entities/finca.entity';
import { FuenteEnergia } from '../FuenteEnergia/entities/fuente-energia.entity';


@Module({
  imports: [TypeOrmModule.forFeature([FincaFuenteEnergia, Finca, FuenteEnergia])],
  controllers: [FincaFuenteEnergiaController],
  providers: [FincaFuenteEnergiaService],
  exports: [FincaFuenteEnergiaService],
})
export class FincaFuenteEnergiaModule {}