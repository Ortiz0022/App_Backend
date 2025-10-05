import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FuenteEnergiaService } from './fuente-energia.service';
import { FuenteEnergiaController } from './fuente-energia.controller';
import { FuenteEnergia } from './entities/fuente-energia.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FuenteEnergia])],
  controllers: [FuenteEnergiaController],
  providers: [FuenteEnergiaService],
  exports: [FuenteEnergiaService],
})
export class FuenteEnergiaModule {}