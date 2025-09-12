import { Controller, Get, Query } from '@nestjs/common';
import { DepartmentSumService } from './department-sum.service';

@Controller('department-sum')
export class DepartmentSumController {
  constructor(private readonly service: DepartmentSumService) {}

  // GET /department-sum/total-income?fiscalYearId=1
  @Get('total-income')
  totalIncome(@Query('fiscalYearId') fiscalYearId: number) {
    return this.service.getGrandIncome(Number(fiscalYearId));
  }
}
