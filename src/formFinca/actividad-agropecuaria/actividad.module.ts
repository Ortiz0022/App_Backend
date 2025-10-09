import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ActividadAgropecuaria } from './entities/actividad.entity';
import { ActividadesAgropecuariasController } from './actividad.controller';
import { ActividadesAgropecuariasService } from './actividad.service';
import { Finca } from '../finca/entities/finca.entity';


@Module({
  imports: [TypeOrmModule.forFeature([ActividadAgropecuaria, Finca])],
  controllers: [ActividadesAgropecuariasController],
  providers: [ActividadesAgropecuariasService],
  exports: [ActividadesAgropecuariasService], 
})
export class ActividadesAgropecuariasModule {}
