import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Forraje } from './entities/forraje.entity';
import { ForrajeService } from './forraje.service';
import { Finca } from '../finca/entities/finca.entity';
import { ForrajeController } from './forraje.cotroller';

@Module({
  imports: [TypeOrmModule.forFeature([Forraje, Finca])],
  controllers: [ForrajeController],
  providers: [ForrajeService],
  exports: [ForrajeService],
})
export class ForrajeModule {}