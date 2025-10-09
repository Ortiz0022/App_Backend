import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssociateService } from './associate.service';
import { AssociateController } from './associate.controller';
import { Associate } from './entities/associate.entity';
import { Persona } from '../persona/entities/persona.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Associate, Persona]) // ✅ Resolver dependencia circular
  ],
  controllers: [AssociateController],
  providers: [AssociateService],
  exports: [AssociateService],
})
export class AssociateModule {}