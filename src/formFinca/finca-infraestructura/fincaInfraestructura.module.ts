import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FincaInfraestructura } from './entities/fincaInfraestructura.entity';
import { Finca } from '../finca/entities/finca.entity';
import { Infraestructura } from '../infraestructura/entities/infraestructura.entity';
import { InfraestructurasModule } from '../infraestructura/infraestructura.module';
import { FincaInfraestructurasController } from './fincaInfraestructura.controller';
import { FincaInfraestructurasService } from './fincaInfraestructura.service';


@Module({
  imports: [
    TypeOrmModule.forFeature([FincaInfraestructura, Finca, Infraestructura]),
    InfraestructurasModule, // para tener el repo/servicio exportado si lo necesitas
  ],
  controllers: [FincaInfraestructurasController],
  providers: [FincaInfraestructurasService],
})
export class FincaInfraestructurasModule {}
