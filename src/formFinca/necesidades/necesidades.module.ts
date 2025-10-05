import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NecesidadesService } from './necesidades.service';
import { NecesidadesController } from './necesidades.controller';
import { Necesidades } from './entities/necesidades.entity';
import { Associate } from 'src/formAssociates/associate/entities/associate.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Necesidades, Associate])],
  controllers: [NecesidadesController],
  providers: [NecesidadesService],
  exports: [NecesidadesService],
})
export class NecesidadesModule {}