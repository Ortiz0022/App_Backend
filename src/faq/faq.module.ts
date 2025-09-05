import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Faq } from './entities/faq.entity';
import { FaqService } from './faq.service';
import { FaqController } from './faq.controller';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Faq]),
    RealtimeModule,
  ],
  controllers: [FaqController],
  providers: [FaqService],
})
export class FaqModule {}
