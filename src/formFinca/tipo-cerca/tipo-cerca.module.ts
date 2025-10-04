import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TipoCerca } from './entities/tipo-cerca.entity';
import { TiposCercaController } from './tipo-cerca.controller';
import { TiposCercaService } from './tipo-cerca.service';

@Module({
  imports: [TypeOrmModule.forFeature([TipoCerca])],
  controllers: [TiposCercaController],
  providers: [TiposCercaService],
  exports: [TiposCercaService, TypeOrmModule], // export para usar el repo en el módulo puente
})
export class TiposCercaModule {}
