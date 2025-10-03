import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FincaService } from './finca.service';
import { FincaController } from './finca.controller';
import { Finca } from './entities/finca.entity';
import { AssociateModule } from '../../formAssociates/associate/associate.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Finca]),
    AssociateModule, 
  ],
  controllers: [FincaController],
  providers: [FincaService],
  exports: [FincaService],
})
export class FincaModule {}