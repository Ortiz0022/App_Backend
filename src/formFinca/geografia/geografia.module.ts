import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeografiaService } from './geografia.service';
import { GeografiaController } from './geografia.controller';
import { Geografia } from './entities/geografia.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Geografia])],
  controllers: [GeografiaController],
  providers: [GeografiaService],
  exports: [GeografiaService],
})
export class GeografiaModule {}