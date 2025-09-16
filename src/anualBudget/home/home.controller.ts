import { Controller, Get, Query } from '@nestjs/common';
import { HomeService } from './home.service';
import { Totals, ComparisonRow } from './dto/home.dto';

@Controller('home')
export class HomeController {
  constructor(private readonly svc: HomeService) {}

  // Cards superiores
  // GET /home/summary?startDate=2025-01-01&endDate=2025-12-31
  @Get('summary')
  summary(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<Totals> {
    return this.svc.getTotals({ startDate, endDate });
  }

  // Tabla de Ingresos
  // GET /home/incomes?groupBy=department|type|subtype&startDate=...&endDate=...
  @Get('incomes')
  incomes(
    @Query('groupBy') groupBy: 'department' | 'type' | 'subtype' = 'department',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    return this.svc.getIncomeComparison({ startDate, endDate }, groupBy);
  }
  // Tabla de Egresos
  // GET /home/spends?groupBy=department|type|subtype&startDate=...&endDate=...
  @Get('spends')
  spends(
    @Query('groupBy') groupBy?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<ComparisonRow[]> {
    return this.svc.getSpendComparison({ startDate, endDate }, groupBy);
  }
}
