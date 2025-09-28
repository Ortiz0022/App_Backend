import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportExtraController } from './reportExtra.controller';
import { ReportExtraService } from './reportExtra.service';
import { ExtraordinaryModule } from '../extraordinary/extraordinary.module';
import { Extraordinary } from '../extraordinary/entities/extraordinary.entity';

@Module({
  imports: [
    ExtraordinaryModule,
    TypeOrmModule.forFeature([Extraordinary]), // Necesario para el servicio
  ],
  controllers: [ReportExtraController],
  providers: [ReportExtraService],
  exports: [ReportExtraService], // Por si otros módulos lo necesitan
})
export class ReportExtraModule {}
