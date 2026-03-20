import { Controller, Get, Query, Req } from '@nestjs/common';
import { HomeService } from './home.service';

@Controller('home')
export class HomeController {
  constructor(private readonly svc: HomeService) {}

  @Get('summary')
  summary(
    @Req() req: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('fiscalYearId') fiscalYearId?: string,
  ) {
    const fyIdFromQuery = Number(fiscalYearId);
    const fyIdFromHeader = Number(req.headers['x-fiscal-year-id'] ?? req.headers['x-fiscal-year']);
    const fyId = Number.isFinite(fyIdFromQuery)
      ? fyIdFromQuery
      : Number.isFinite(fyIdFromHeader)
        ? fyIdFromHeader
        : undefined;

    return this.svc.getTotals({ startDate, endDate }, fyId);
  }

  @Get('incomes')
  incomes(
    @Req() req: any,
    @Query('groupBy') groupBy?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('fiscalYearId') fiscalYearId?: string,
  ) {
    const fyIdFromQuery = Number(fiscalYearId);
    const fyIdFromHeader = Number(req.headers['x-fiscal-year-id'] ?? req.headers['x-fiscal-year']);
    const fyId = Number.isFinite(fyIdFromQuery)
      ? fyIdFromQuery
      : Number.isFinite(fyIdFromHeader)
        ? fyIdFromHeader
        : undefined;

    return this.svc.getIncomeComparison({ startDate, endDate }, groupBy, fyId);
  }

  @Get('spends')
  spends(
    @Req() req: any,
    @Query('groupBy') groupBy?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('fiscalYearId') fiscalYearId?: string,
  ) {
    const fyIdFromQuery = Number(fiscalYearId);
    const fyIdFromHeader = Number(req.headers['x-fiscal-year-id'] ?? req.headers['x-fiscal-year']);
    const fyId = Number.isFinite(fyIdFromQuery)
      ? fyIdFromQuery
      : Number.isFinite(fyIdFromHeader)
        ? fyIdFromHeader
        : undefined;

    return this.svc.getSpendComparison({ startDate, endDate }, groupBy, fyId);
  }
}