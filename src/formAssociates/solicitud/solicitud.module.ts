import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SolicitudService } from './solicitud.service';
import { SolicitudController } from './solicitud.controller';
import { Solicitud } from './entities/solicitud.entity';
import { Associate } from 'src/formAssociates/associate/entities/associate.entity';
import { Persona } from 'src/formAssociates/persona/entities/persona.entity';
import { Finca } from 'src/formFinca/finca/entities/finca.entity';
import { Geografia } from 'src/formFinca/geografia/entities/geografia.entity';  
import { NucleoFamiliar } from 'src/formAssociates/nucleo-familiar/entities/nucleo-familiar.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Solicitud,
      Associate,
      Persona,
      Finca,
      Geografia, 
      NucleoFamiliar,
    ]),
  ],
  controllers: [SolicitudController],
  providers: [SolicitudService],
  exports: [SolicitudService],
})
export class SolicitudModule {}