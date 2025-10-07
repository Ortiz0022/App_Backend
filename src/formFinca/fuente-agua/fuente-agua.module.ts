import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FuenteAgua } from './entities/fuente-agua.entity';
import { FuentesAguaController } from './fuente-agua.controller';
import { FuentesAguaService } from './fuente-agua.service';
import { Finca } from '../finca/entities/finca.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FuenteAgua, Finca])],
  controllers: [FuentesAguaController],
  providers: [FuentesAguaService],
  exports: [FuentesAguaService],
})
export class FuentesAguaModule {}
