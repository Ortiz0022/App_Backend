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
import { HatoModule } from 'src/formFinca/hato/hato.module';
import { AnimalModule } from 'src/formFinca/animal/animal.module';
import { ForrajeModule } from 'src/formFinca/forraje/forraje.module';
import { RegistrosProductivosModule } from 'src/formFinca/registros-productivos/registros-productivos.module';
import { FuentesAguaModule } from 'src/formFinca/fuente-agua/fuente-agua.module';
import { MetodoRiegoModule } from 'src/formFinca/metodo-riego/metodo-riego.module';
import { ActividadesAgropecuariasModule } from 'src/formFinca/actividad-agropecuaria/actividad.module';
import { FincaOtroEquipoModule } from 'src/formFinca/otros-equipos/finca-equipo.module';
import { InfraestructuraProduccionModule } from 'src/formFinca/equipo/equipo.module';
import { TiposCercaModule } from 'src/formFinca/tipo-cerca/tipo-cerca.module';
import { FincaTipoCercaModule } from 'src/formFinca/finca-tipo-cerca/finca-tipo-cerca.module';
import { InfraestructurasModule } from 'src/formFinca/infraestructura/infraestructura.module';
import { FincaInfraestructurasModule } from 'src/formFinca/finca-infraestructura/fincaInfraestructura.module';
import { CorrienteElectricaModule } from 'src/formFinca/corriente-electrica/corriente.module';
import { AccesoModule } from 'src/formFinca/acceso/acceso.module';

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
    HatoModule,
    AnimalModule,
    ForrajeModule,
    RegistrosProductivosModule,
    FuentesAguaModule,
    MetodoRiegoModule,
    ActividadesAgropecuariasModule, 
    InfraestructuraProduccionModule,  
    FincaOtroEquipoModule,   
    TiposCercaModule,          
    FincaTipoCercaModule, 
    InfraestructurasModule,           
    FincaInfraestructurasModule,    
    CorrienteElectricaModule, 
    AccesoModule,
  ],
  controllers: [SolicitudController],
  providers: [SolicitudService],
  exports: [SolicitudService],
})
export class SolicitudModule {}