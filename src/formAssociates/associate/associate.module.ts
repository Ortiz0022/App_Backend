import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssociateService } from './associate.service';
import { AssociateController } from './associate.controller';
import { Associate } from './entities/associate.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Associate])],
  controllers: [AssociateController],
  providers: [AssociateService],
  exports: [AssociateService, TypeOrmModule], // Exportar para usar en otros módulos
})
export class AssociateModule {}