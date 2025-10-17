import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SolicitudVoluntariadoService } from './solicitud-voluntariado.service';
import { SolicitudVoluntariadoController } from './solicitud-voluntariado.controller';
import { SolicitudVoluntariado } from './entities/solicitud-voluntariado.entity';
import { VoluntarioIndividualModule } from '../voluntario-individual/voluntario-individual.module';
import { OrganizacionModule } from '../organizacion/organizacion.module';
import { RepresentanteModule } from '../representante/representante.module';
import { RazonSocialModule } from '../razon-social/razon-social.module';
import { DisponibilidadModule } from '../disponibilidad/disponibilidad.module';
import { AreasInteresModule } from '../areas-interes/areas-interes.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SolicitudVoluntariado]),
    VoluntarioIndividualModule,
    OrganizacionModule,
    RepresentanteModule,
    RazonSocialModule,
    DisponibilidadModule,
    AreasInteresModule,
  ],
  controllers: [SolicitudVoluntariadoController],
  providers: [SolicitudVoluntariadoService],
  exports: [SolicitudVoluntariadoService],
})
export class SolicitudVoluntariadoModule {}