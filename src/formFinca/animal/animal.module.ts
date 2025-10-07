import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnimalService } from './animal.service';
import { AnimalController } from './animal.controller';
import { Animal } from './entities/animal.entity';
import { Hato } from 'src/formFinca/hato/entities/hato.entity';
import { forwardRef } from '@nestjs/common';
import { HatoModule } from '../hato/hato.module';

@Module({
  imports: [TypeOrmModule.forFeature([Animal, Hato]),
  forwardRef(() => HatoModule), 
],
  controllers: [AnimalController],
  providers: [AnimalService],
  exports: [AnimalService],
})
export class AnimalModule {}