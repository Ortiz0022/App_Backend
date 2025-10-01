import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FincaService } from './finca.service';
import { FincaController } from './finca.controller';
import { Finca } from './entities/finca.entity';
import { AssociatesModule } from '../associates/associates.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Finca]),
    AssociatesModule, 
  ],
  controllers: [FincaController],
  providers: [FincaService],
  exports: [FincaService],
})
export class FincaModule {}