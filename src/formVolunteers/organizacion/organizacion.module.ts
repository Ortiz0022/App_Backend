import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizacionService } from './organizacion.service';
import { OrganizacionController } from './organizacion.controller';
import { Organizacion } from './entities/organizacion.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Organizacion])],
  controllers: [OrganizacionController],
  providers: [OrganizacionService],
  exports: [OrganizacionService, TypeOrmModule],
})
export class OrganizacionModule {}