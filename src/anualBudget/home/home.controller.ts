// src/anualBudget/home/home.controller.ts
import { Controller, Get, Query, Req } from '@nestjs/common';
import { HomeService } from './home.service';

@Controller('home')
export class HomeController {
  constructor(private readonly svc: HomeService) {}

  @Get('summary')
  summary(@Req() req: any,
          @Query('startDate') startDate?: string,
          @Query('endDate') endDate?: string) {
    const fyId = Number(req.headers['x-fiscal-year-id'] ?? req.headers['x-fiscal-year']);
    return this.svc.getTotals({ startDate, endDate }, Number.isFinite(fyId) ? fyId : undefined);
  }

  @Get('incomes')
  incomes(@Req() req: any,
          @Query('groupBy') groupBy?: string,
          @Query('startDate') startDate?: string,
          @Query('endDate') endDate?: string) {
    const fyId = Number(req.headers['x-fiscal-year-id'] ?? req.headers['x-fiscal-year']);
    return this.svc.getIncomeComparison({ startDate, endDate }, groupBy, Number.isFinite(fyId) ? fyId : undefined);
  }

  @Get('spends')
  spends(@Req() req: any,
         @Query('groupBy') groupBy?: string,
         @Query('startDate') startDate?: string,
         @Query('endDate') endDate?: string) {
    const fyId = Number(req.headers['x-fiscal-year-id'] ?? req.headers['x-fiscal-year']);
    return this.svc.getSpendComparison({ startDate, endDate }, groupBy, Number.isFinite(fyId) ? fyId : undefined);
  }
}

