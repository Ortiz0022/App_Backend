import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CorrienteElectricaController } from './corriente.controller';
import { CorrienteElectricaService } from './corriente.service';
import { CorrienteElectrica } from './entities/corriente.entity';


@Module({
  imports: [TypeOrmModule.forFeature([CorrienteElectrica])],
  controllers: [CorrienteElectricaController],
  providers: [CorrienteElectricaService],
  exports: [TypeOrmModule, CorrienteElectricaService],
})
export class CorrienteElectricaModule {}
