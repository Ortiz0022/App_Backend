import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DisponibilidadService } from './disponibilidad.service';
import { DisponibilidadController } from './disponibilidad.controller';
import { Disponibilidad } from './entities/disponibilidad.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Disponibilidad])],
  controllers: [DisponibilidadController],
  providers: [DisponibilidadService],
  exports: [DisponibilidadService, TypeOrmModule],
})
export class DisponibilidadModule {}