import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { TotalSumService } from './total-sum.service';

@Controller('total-sum')
export class TotalSumController {
  constructor(private readonly svc: TotalSumService) {}

  // Recalcula y persiste el total GLOBAL del año fiscal
  // GET /total-sum/recalc?fiscalYearId=1
  @Get('recalc')
  recalc(@Query('fiscalYearId') fiscalYearId: string) {
    return this.svc.recalc(Number(fiscalYearId));
  }

  // Lista todos los snapshots guardados
  // GET /total-sum
  @Get()
  list() {
    return this.svc.findAll();
  }

  // Obtiene el snapshot por año fiscal
  // GET /total-sum/by-fy/1
  @Get('by-fy/:fiscalYearId')
  byFY(@Param('fiscalYearId', ParseIntPipe) fiscalYearId: number) {
    return this.svc.findOneByFiscalYear(fiscalYearId);
  }
}
