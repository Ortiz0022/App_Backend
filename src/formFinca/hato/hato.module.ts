import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HatoService } from './hato.service';
import { HatoController } from './hato.controller';
import { Hato } from './entities/hato.entity';
import { Finca } from '../finca/entities/finca.entity';


@Module({
  imports: [TypeOrmModule.forFeature([Hato, Finca])],
  controllers: [HatoController],
  providers: [HatoService],
  exports: [HatoService],
})
export class HatoModule {}