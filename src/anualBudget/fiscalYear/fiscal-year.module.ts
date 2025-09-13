import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FiscalYear } from './entities/fiscal-year.entity';
import { FiscalYearService } from './fiscal-year.service';
import { FiscalYearController } from './fiscal-year.controller';

@Module({
  imports: [TypeOrmModule.forFeature([FiscalYear])],
  controllers: [FiscalYearController],   // 👈 expone /fiscal-year
  providers: [FiscalYearService],
  exports: [TypeOrmModule, FiscalYearService],
})
export class FiscalYearModule {}
