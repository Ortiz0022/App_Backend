import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Infraestructura } from './entities/infraestructura.entity';
import { InfraestructurasController } from './infraestructura.controller';
import { InfraestructurasService } from './infraestructura.service';

@Module({
  imports: [TypeOrmModule.forFeature([Infraestructura])],
  controllers: [InfraestructurasController],
  providers: [InfraestructurasService],
  exports: [InfraestructurasService, TypeOrmModule], // export para usar Repo/Service en el módulo puente
})
export class InfraestructurasModule {}
