import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { PTotalSumService } from './p-total-sum.service';

@Controller('p-total-sum')
export class PTotalSumController {
  constructor(private readonly svc: PTotalSumService) {}

  // Recalcula para un FY y devuelve el snapshot resultante
  // GET /p-total-sum/sync?fiscalYearId=1
  @Get('sync')
  sync(@Query('fiscalYearId') fiscalYearId: string) {
    return this.svc.recalcForFiscalYear(Number(fiscalYearId));
  }

  // Obtiene el snapshot por FY
  // GET /p-total-sum/by-fy/1
  @Get('by-fy/:fiscalYearId')
  byFY(@Param('fiscalYearId', ParseIntPipe) fiscalYearId: number) {
    return this.svc.findByFiscalYear(fiscalYearId);
  }

  // Lista todos los snapshots
  // GET /p-total-sum
  @Get()
  list() {
    return this.svc.findAll();
  }
}
