import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssociateService } from './associate.service';
import { AssociateController } from './associate.controller';
import { Associate } from './entities/associate.entity';
import { PersonaModule } from '../persona/persona.module';


@Module({
  imports: [
    TypeOrmModule.forFeature([Associate]),
    PersonaModule, // Importar módulo de persona para acceder a su repositorio
  ],
  controllers: [AssociateController],
  providers: [AssociateService],
  exports: [AssociateService],
})
export class AssociateModule {}