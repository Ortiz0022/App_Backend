import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RepresentanteService } from './representante.service';
import { RepresentanteController } from './representante.controller';
import { Representante } from './entities/representante.entity';
import { PersonaModule } from '../../formAssociates/persona/persona.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Representante]),
    PersonaModule,
  ],
  controllers: [RepresentanteController],
  providers: [RepresentanteService],
  exports: [RepresentanteService, TypeOrmModule],
})
export class RepresentanteModule {}