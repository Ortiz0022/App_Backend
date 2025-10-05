import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MetodoRiegoService } from './metodo-riego.service';
import { MetodoRiegoController } from './metodo-riego.controller';
import { MetodoRiego } from './entities/metodo-riego.entity';
import { Finca } from '../finca/entities/finca.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MetodoRiego, Finca])],
  controllers: [MetodoRiegoController],
  providers: [MetodoRiegoService],
  exports: [MetodoRiegoService],
})
export class MetodoRiegoModule {}