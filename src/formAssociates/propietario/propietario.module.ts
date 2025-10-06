import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PropietarioService } from './propietario.service';
import { PropietarioController } from './propietario.controller';
import { Propietario } from './entities/propietario.entity';
import { Persona } from 'src/formAssociates/persona/entities/persona.entity';
import { PersonaModule } from '../persona/persona.module';

@Module({
  imports: [TypeOrmModule.forFeature([Propietario, Persona]), PersonaModule],
  controllers: [PropietarioController],
  providers: [PropietarioService],
  exports: [PropietarioService], // Para usar en otros módulos
})
export class PropietarioModule {}