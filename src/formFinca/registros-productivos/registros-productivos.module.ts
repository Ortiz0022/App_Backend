import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegistrosProductivosService } from './registros-productivos.service';
import { RegistrosProductivosController } from './registros-productivos.controller';
import { RegistrosProductivos } from './entities/registros-productivos.entity';
import { Finca } from '../finca/entities/finca.entity';


@Module({
  imports: [TypeOrmModule.forFeature([RegistrosProductivos, Finca])],
  controllers: [RegistrosProductivosController],
  providers: [RegistrosProductivosService],
  exports: [RegistrosProductivosService],
})
export class RegistrosProductivosModule {}