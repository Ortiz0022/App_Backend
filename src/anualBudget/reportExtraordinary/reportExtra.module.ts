import { Module } from '@nestjs/common';
import { ReportExtraController } from './reportExtra.controller';
import { ExtraordinaryModule } from '../extraordinary/extraordinary.module';

@Module({
  imports: [ExtraordinaryModule],        
  controllers: [ReportExtraController],
})
export class ReportExtraModule {}