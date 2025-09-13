import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Extraordinary } from './entities/extraordinary.entity';
import { ExtraordinaryService } from './extraordinary.service';
import { ExtraordinaryController } from './extraordinary.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Extraordinary])],
  controllers: [ExtraordinaryController],
  providers: [ExtraordinaryService],
  exports: [ExtraordinaryService],
})
export class ExtraordinaryModule {}
