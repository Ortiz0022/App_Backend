import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SolicitudService } from './solicitud.service';
import { SolicitudController } from './solicitud.controller';
import { Solicitud } from './entities/solicitud.entity';
import { Associate } from 'src/formAssociates/associate/entities/associate.entity';
import { PersonaModule } from '../persona/persona.module';
import { NucleoFamiliarModule } from '../nucleo-familiar/nucleo-familiar.module';
import { FincaModule } from 'src/formFinca/finca/finca.module'; 
import { GeografiaModule } from 'src/formFinca/geografia/geografia.module';
import { PropietarioModule } from '../propietario/propietario.module';
import { Persona } from '../persona/entities/persona.entity';
import { Finca } from 'src/formFinca/finca/entities/finca.entity';
import { DropboxModule } from 'src/dropbox/dropbox.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Solicitud,
      Associate,
      Persona,
      Finca,
    ]),
    PersonaModule,
    NucleoFamiliarModule,
    FincaModule,
    GeografiaModule,
    PropietarioModule,
    DropboxModule,
  ],
  controllers: [SolicitudController],
  providers: [SolicitudService],
  exports: [SolicitudService],
})
export class SolicitudModule {}