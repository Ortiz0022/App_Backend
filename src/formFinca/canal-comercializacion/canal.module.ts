import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CanalComercializacion } from './entities/canal.entity';
import { CanalesComercializacionController } from './canal.controller';
import { CanalesComercializacionService } from './canal.service';
import { Finca } from '../finca/entities/finca.entity';


@Module({
  imports: [TypeOrmModule.forFeature([CanalComercializacion, Finca])],
  controllers: [CanalesComercializacionController],
  providers: [CanalesComercializacionService],
  exports: [CanalesComercializacionService],
})
export class CanalesComercializacionModule {}
