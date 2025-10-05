import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccesoService } from './acceso.service';
import { AccesoController } from './acceso.controller';
import { Acceso } from './entities/acceso.entity';
import { Finca } from '../finca/entities/finca.entity';


@Module({
  imports: [TypeOrmModule.forFeature([Acceso, Finca])],
  controllers: [AccesoController],
  providers: [AccesoService],
  exports: [AccesoService],
})
export class AccesoModule {}