import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FiscalYear } from './entities/fiscal-year.entity';
import { FiscalYearService } from './fiscal-year.service';
import { FiscalYearController } from './fiscal-year.controller';

@Module({
  imports: [TypeOrmModule.forFeature([FiscalYear])],
  controllers: [FiscalYearController],  // <-- está el controller
  providers: [FiscalYearService],
  exports: [FiscalYearService],
})
export class FiscalYearModule {}
