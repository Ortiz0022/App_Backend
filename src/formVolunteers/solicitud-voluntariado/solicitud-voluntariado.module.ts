import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SolicitudVoluntariadoService } from './solicitud-voluntariado.service';
import { SolicitudVoluntariadoController } from './solicitud-voluntariado.controller';
import { SolicitudVoluntariado } from './entities/solicitud-voluntariado.entity';
import { VoluntarioIndividualModule } from '../voluntario-individual/voluntario-individual.module';
import { OrganizacionModule } from '../organizacion/organizacion.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SolicitudVoluntariado]),
    VoluntarioIndividualModule,
    OrganizacionModule,
  ],
  controllers: [SolicitudVoluntariadoController],
  providers: [SolicitudVoluntariadoService],
  exports: [SolicitudVoluntariadoService],
})
export class SolicitudVoluntariadoModule {}