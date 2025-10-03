import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SolicitudService } from './solicitud.service';
import { SolicitudController } from './solicitud.controller';
import { Solicitud } from './entities/solicitud.entity';
import { Associate } from 'src/formAssociates/associate/entities/associate.entity';
import { PersonaModule } from 'src/formAssociates/persona/persona.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Solicitud, Associate]),
    PersonaModule,
  ],
  controllers: [SolicitudController],
  providers: [SolicitudService],
  exports: [SolicitudService],
})
export class SolicitudModule {}