import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VoluntarioIndividualService } from './voluntario-individual.service';
import { VoluntarioIndividualController } from './voluntario-individual.controller';
import { VoluntarioIndividual } from './entities/voluntario-individual.entity';
import { PersonaModule } from '../../formAssociates/persona/persona.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([VoluntarioIndividual]),
    PersonaModule,
  ],
  controllers: [VoluntarioIndividualController],
  providers: [VoluntarioIndividualService],
  exports: [VoluntarioIndividualService],
})
export class VoluntarioIndividualModule {}