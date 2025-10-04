import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FincaTipoCercaService } from './finca-tipo-cerca.service';
import { FincaTipoCercaController } from './finca-tipo-cerca.controller';
import { FincaTipoCerca } from './entities/finca-tipo-cerca.entity';
import { Finca } from '../finca/entities/finca.entity';
import { TipoCerca } from '../tipo-cerca/entities/tipo-cerca.entity';
import { TiposCercaModule } from '../tipo-cerca/tipo-cerca.module';


@Module({
  imports: [
    TypeOrmModule.forFeature([FincaTipoCerca, Finca, TipoCerca]),
    TiposCercaModule,
  ],
  controllers: [FincaTipoCercaController],
  providers: [FincaTipoCercaService],
})
export class FincaTipoCercaModule {}
