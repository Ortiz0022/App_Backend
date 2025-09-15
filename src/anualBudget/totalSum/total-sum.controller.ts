import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { TotalSumService } from './total-sum.service';

@Controller('total-sum')
export class TotalSumController {
  constructor(private readonly svc: TotalSumService) {}

  // Recalcula para un FY y devuelve el snapshot resultante
  // GET /total-sum/sync?fiscalYearId=1
  @Get('sync')
  sync(@Query('fiscalYearId') fiscalYearId: string) {
    return this.svc.recalcForFiscalYear(Number(fiscalYearId));
  }

  // Obtiene el snapshot por FY
  // GET /total-sum/by-fy/1
  @Get('by-fy/:fiscalYearId')
  byFY(@Param('fiscalYearId', ParseIntPipe) fiscalYearId: number) {
    return this.svc.findByFiscalYear(fiscalYearId);
  }

  // Lista todos los snapshots
  // GET /total-sum
  @Get()
  list() {
    return this.svc.findAll();
  }
}
